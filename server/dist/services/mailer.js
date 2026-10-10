import nodemailer from 'nodemailer';
import { getSettings } from '../models/Settings.js';
import { takeEmailQuota } from './spamGuard.js';
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
    if (!takeEmailQuota()) {
        console.warn('[mail] daily email limit reached; skipping email (submissions are still saved)');
        return { sent: false, reason: 'daily_limit' };
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
