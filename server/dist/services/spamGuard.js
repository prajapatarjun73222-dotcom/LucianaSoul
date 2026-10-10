import crypto from 'node:crypto';
import { config } from '../config.js';
const MIN_FILL_MS = 3000;
const MAX_LINKS = 3;
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
const recent = new Map();
function isDuplicate(email, text) {
    const now = Date.now();
    for (const [key, at] of recent)
        if (now - at > DUPLICATE_WINDOW_MS)
            recent.delete(key);
    const key = crypto.createHash('sha256').update(`${email.toLowerCase()}|${text.trim().toLowerCase()}`).digest('hex');
    if (recent.has(key))
        return true;
    recent.set(key, now);
    return false;
}
async function verifyTurnstile(token, ip) {
    if (!config.protection.turnstileSecret)
        return true;
    if (!token)
        return false;
    try {
        const body = new URLSearchParams({ secret: config.protection.turnstileSecret, response: token });
        if (ip)
            body.set('remoteip', ip);
        const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
        const data = (await res.json());
        return data.success === true;
    }
    catch (err) {
        console.error('[spam] Turnstile verification failed:', err.message);
        return false;
    }
}
/**
 * Silent rejections answer like a success so bots get no signal; only the human check returns a visible error.
 */
export async function checkSubmission(opts) {
    if (opts.website)
        return { ok: false, silent: true };
    if (opts.startedAt && Date.now() - opts.startedAt < MIN_FILL_MS)
        return { ok: false, silent: true };
    if ((opts.text.match(/https?:\/\/|www\./gi) ?? []).length > MAX_LINKS)
        return { ok: false, silent: true };
    if (!(await verifyTurnstile(opts.turnstileToken, opts.ip))) {
        return { ok: false, silent: false, error: 'Please confirm you are human and try again.' };
    }
    if (isDuplicate(opts.email, opts.text))
        return { ok: false, silent: true };
    return { ok: true };
}
let day = '';
let sentToday = 0;
/** Counts an outgoing email against the daily cap; returns false once the cap is reached. */
export function takeEmailQuota() {
    const today = new Date().toISOString().slice(0, 10);
    if (today !== day) {
        day = today;
        sentToday = 0;
    }
    if (sentToday >= config.protection.emailDailyLimit)
        return false;
    sentToday += 1;
    return true;
}
