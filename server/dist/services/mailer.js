import nodemailer from 'nodemailer';
import { getSettings } from '../models/Settings.js';
export function isSmtpConfigured(smtp) {
    return Boolean(smtp?.host && smtp?.user && smtp?.pass);
}
function transportFor(smtp) {
    return nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port ?? 587,
        secure: smtp.secure ?? false,
        auth: { user: smtp.user, pass: smtp.pass },
    });
}
export async function sendMail(opts) {
    const settings = await getSettings();
    const smtp = settings.smtp;
    if (!isSmtpConfigured(smtp)) {
        console.log('[mail] SMTP not configured in admin settings; skipping email');
        return { sent: false, reason: 'not_configured' };
    }
    await transportFor(smtp).sendMail({
        from: smtp.from || `LucianaSoul Website <${smtp.user}>`,
        to: opts.to || smtp.notifyTo || settings.contact?.email || smtp.user,
        replyTo: opts.replyTo,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
    });
    return { sent: true };
}
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
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
    const filled = rows.filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '');
    const text = filled.map(([k, v]) => `${k}: ${v}`).join('\n');
    const html = `<div style="font-family:Georgia,serif;color:#302D2A;background:#FBF1E7;padding:24px">
    <h2 style="font-weight:400;letter-spacing:.08em">New enquiry from the LucianaSoul website</h2>
    <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      ${filled
        .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#514B47;vertical-align:top;text-transform:uppercase;font-size:11px;letter-spacing:.15em">${escapeHtml(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(String(v))}</td></tr>`)
        .join('')}
    </table></div>`;
    return { subject: `New ${String(e.type ?? 'general')} enquiry from ${String(e.name ?? 'website')}`, text, html };
}
