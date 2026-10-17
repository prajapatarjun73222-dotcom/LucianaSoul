import { config } from '../config.js';
import { getSettings } from '../models/Settings.js';
import { takeEmailQuota } from './spamGuard.js';
const DEFAULT_SENDER = { name: 'LucianaSoul Website', email: 'fixhance@gmail.com' };
function brevoKey(smtp) {
    return smtp?.brevoApiKey || config.brevoApiKey;
}
function senderFor(from) {
    const raw = (from ?? '').trim();
    if (!raw)
        return DEFAULT_SENDER;
    const named = raw.match(/^(.*?)<([^>]+)>$/);
    if (named) {
        const name = named[1].trim().replace(/^"|"$/g, '');
        const email = named[2].trim();
        return { name: name || DEFAULT_SENDER.name, email };
    }
    if (raw.includes('@'))
        return { name: DEFAULT_SENDER.name, email: raw };
    return DEFAULT_SENDER;
}
export function isSmtpConfigured(smtp) {
    if (smtp?.enabled === false)
        return false;
    return Boolean(brevoKey(smtp));
}
export async function sendMail(opts) {
    const settings = await getSettings();
    const smtp = settings.smtp;
    if (!isSmtpConfigured(smtp)) {
        console.log('[mail] email is turned off or the Brevo API key is missing; skipping email');
        return { sent: false, reason: 'not_configured' };
    }
    const to = opts.to || smtp?.notifyTo || settings.contact?.email || '';
    if (!to) {
        console.log('[mail] no recipient address; skipping email');
        return { sent: false, reason: 'not_configured' };
    }
    if (!takeEmailQuota()) {
        console.warn('[mail] daily email limit reached; skipping email (submissions are still saved)');
        return { sent: false, reason: 'daily_limit' };
    }
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': brevoKey(smtp),
            'content-type': 'application/json',
            accept: 'application/json',
        },
        body: JSON.stringify({
            sender: senderFor(smtp?.from),
            to: [{ email: to }],
            replyTo: opts.replyTo ? { email: opts.replyTo } : undefined,
            subject: opts.subject,
            textContent: opts.text,
            htmlContent: opts.html,
        }),
    });
    if (!response.ok) {
        const body = (await response.json().catch(() => null));
        throw new Error(body?.message || `Brevo rejected the email (${response.status})`);
    }
    return { sent: true };
}
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function rowsEmail(heading, rows) {
    const filled = rows.filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '');
    const text = filled.map(([k, v]) => `${k}: ${v}`).join('\n');
    const html = `<div style="font-family:Georgia,serif;color:#302D2A;background:#FBF1E7;padding:24px">
    <h2 style="font-weight:400;letter-spacing:.08em">${escapeHtml(heading)}</h2>
    <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      ${filled
        .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#514B47;vertical-align:top;text-transform:uppercase;font-size:11px;letter-spacing:.15em">${escapeHtml(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(String(v))}</td></tr>`)
        .join('')}
    </table></div>`;
    return { text, html };
}
const DEV_SERVICE_LABELS = {
    new_website: 'New website',
    redesign: 'Website redesign',
    bug_fix: 'Bug fix / issue',
    maintenance: 'Maintenance & updates',
    other: 'Other',
};
export function developerLeadEmail(l) {
    const service = DEV_SERVICE_LABELS[String(l.service)] ?? String(l.service ?? '');
    const { text, html } = rowsEmail('New web development lead (via LucianaSoul website)', [
        ['Service', service],
        ['Name', l.name],
        ['Email', l.email],
        ['WhatsApp', l.whatsapp],
        ['Message', l.message],
    ]);
    return { subject: `New lead: ${service} from ${String(l.name ?? 'website')}`, text, html };
}
export function developerLeadThankYouEmail(l, dev) {
    const who = dev.name || 'the developer';
    const service = (DEV_SERVICE_LABELS[String(l.service)] ?? 'your project').toLowerCase();
    const contactLines = [
        dev.whatsapp && `WhatsApp: https://wa.me/${dev.whatsapp}`,
        dev.email && `Email: ${dev.email}`,
        dev.portfolioUrl && `Portfolio: ${dev.portfolioUrl}`,
    ].filter(Boolean);
    const paragraphs = [
        `Hi ${String(l.name ?? '')},`,
        `Thank you for getting in touch about ${service}. I have received your message and will get back to you soon.`,
        ...(contactLines.length ? ['If it is urgent, feel free to reach me directly:'] : []),
    ];
    const text = [...paragraphs, ...contactLines, '', `Thanks,\n${who}`].join('\n\n');
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#302D2A;background:#FBF1E7;padding:24px">
    ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
    <ul>${contactLines.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
    <p>Thanks,<br>${escapeHtml(who)}</p>
  </div>`;
    return { subject: `Thanks for reaching out, ${String(l.name ?? '')}`, text, html };
}
export function enquiryEmail(e) {
    const rows = [
        ['Type', e.type],
        ['Name', e.name],
        ['Email', e.email],
        ['Phone', e.phone],
        ['Preferred contact', e.preferredContact],
        ['Piece', e.productName],
        ['Design idea', e.designIdea],
        ['Measurements / notes', e.measurements],
        ['Reference image', e.referenceImageUrl],
        ['Message', e.message],
    ];
    const { text, html } = rowsEmail('New enquiry from the LucianaSoul website', rows);
    return { subject: `New ${String(e.type ?? 'general')} enquiry from ${String(e.name ?? 'website')}`, text, html };
}
