import { Router } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { getSettings, HOMEPAGE_SLOTS } from '../models/Settings.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, validateBody } from '../middleware/validate.js';
import { isSmtpConfigured, sendMail } from '../services/mailer.js';
export const publicSettings = Router();
export const adminSettings = Router();
const objectId = z.string().refine((v) => Types.ObjectId.isValid(v));
const settingsSchema = z
    .object({
    homepage: z.object(Object.fromEntries(HOMEPAGE_SLOTS.map((s) => [s, z.array(objectId)]))).partial(),
    about: z
        .object({
        designer: z.string(),
        philosophy: z.string(),
        upcycling: z.string(),
        bespoke: z.string(),
        london: z.string(),
        designerMedia: objectId.nullable(),
    })
        .partial(),
    sustainabilityText: z.string(),
    contact: z
        .object({
        phone: z.string(),
        whatsapp: z.string().regex(/^\d{6,15}$/, 'Digits only, including country code'),
        email: z.string().email(),
        addressLines: z.array(z.string()),
        instagram: z.string(),
        googleMapsUrl: z.string().url().or(z.literal('')),
    })
        .partial(),
    seo: z.object({ title: z.string(), description: z.string(), ogImage: z.string() }).partial(),
    collectionCategories: z.array(z.object({ key: z.string(), label: z.string(), visible: z.boolean() })),
    smtp: z
        .object({
        host: z.string(),
        port: z.number().int().min(1).max(65535),
        secure: z.boolean(),
        user: z.string(),
        pass: z.string(),
        from: z.string(),
        notifyTo: z.string().email().or(z.literal('')),
    })
        .partial(),
})
    .partial();
function publicView(doc) {
    const { smtp: _smtp, ...rest } = doc;
    return rest;
}
publicSettings.get('/', asyncHandler(async (_req, res) => {
    const settings = await getSettings();
    await settings.populate([
        ...HOMEPAGE_SLOTS.map((slot) => ({ path: `homepage.${slot}` })),
        { path: 'about.designerMedia' },
    ]);
    res.json(publicView(settings.toObject()));
}));
function applySettings(settings, body) {
    for (const [section, value] of Object.entries(body)) {
        if (value === undefined)
            continue;
        if (Array.isArray(value) || typeof value !== 'object' || value === null) {
            settings.set(section, value);
            continue;
        }
        for (const [key, v] of Object.entries(value)) {
            // An empty SMTP password from the form means "keep the stored one".
            if (section === 'smtp' && key === 'pass' && v === '')
                continue;
            settings.set(`${section}.${key}`, v === null ? undefined : v);
        }
    }
}
adminSettings.use(requireAuth);
adminSettings.get('/', asyncHandler(async (_req, res) => {
    const settings = (await getSettings()).toObject();
    const smtp = settings.smtp ?? {};
    res.json({
        ...settings,
        smtp: { ...smtp, pass: '', hasPassword: Boolean(smtp.pass) },
        smtpConfigured: isSmtpConfigured(smtp),
    });
}));
async function updateSettings(req, res) {
    const settings = await getSettings();
    applySettings(settings, req.body);
    await settings.save();
    res.json({ ok: true });
}
adminSettings.put('/', validateBody(settingsSchema), asyncHandler(updateSettings));
publicSettings.put('/', requireAuth, validateBody(settingsSchema), asyncHandler(updateSettings));
adminSettings.post('/test-email', asyncHandler(async (_req, res) => {
    try {
        const result = await sendMail({
            subject: 'LucianaSoul website: test email',
            text: 'Email notifications from the LucianaSoul website are working.',
        });
        if (!result.sent)
            return res.status(400).json({ error: 'SMTP is not configured yet' });
        res.json({ ok: true });
    }
    catch (err) {
        res.status(400).json({ error: `Could not send: ${err.message}` });
    }
}));
