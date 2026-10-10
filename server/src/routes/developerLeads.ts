import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { DeveloperLead, DEV_LEAD_STATUSES, DEV_SERVICES } from '../models/DeveloperLead.js';
import { getSettings } from '../models/Settings.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, validateBody } from '../middleware/validate.js';
import { developerLeadEmail, developerLeadThankYouEmail, sendMail } from '../services/mailer.js';
import { checkSubmission } from '../services/spamGuard.js';

export const publicDeveloperLeads = Router();
export const adminDeveloperLeads = Router();

const leadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 7, standardHeaders: true, legacyHeaders: false });

const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  whatsapp: z.string().trim().max(40).optional().default(''),
  service: z.enum(DEV_SERVICES).default('new_website'),
  message: z.string().trim().min(1, 'Please tell me a little about what you need.').max(5000),
  website: z.string().optional(), // honeypot
  startedAt: z.number().optional(),
  turnstileToken: z.string().max(4096).optional(),
});

publicDeveloperLeads.post(
  '/',
  leadLimiter,
  validateBody(leadSchema),
  asyncHandler(async (req, res) => {
    const settings = await getSettings();
    if (!settings.developer?.enabled) return res.status(404).json({ error: 'Not found' });

    const { website, startedAt, turnstileToken, ...body } = req.body as z.infer<typeof leadSchema>;
    const verdict = await checkSubmission({ website, startedAt, turnstileToken, email: body.email, text: body.message, ip: req.ip });
    if (!verdict.ok) {
      if (verdict.silent) return res.status(201).json({ ok: true });
      return res.status(400).json({ error: verdict.error });
    }

    const lead = await DeveloperLead.create(body);

    // ADMIN_EMAIL is often a login-only address (e.g. *.local), so fall back to the SMTP mailbox instead.
    const devEmail = settings.developer.email || settings.smtp?.user || '';
    if (devEmail) {
      try {
        const result = await sendMail({ ...developerLeadEmail(lead.toObject()), to: devEmail, replyTo: lead.email });
        if (result.sent) await DeveloperLead.updateOne({ _id: lead._id }, { emailNotified: true });
      } catch (err) {
        console.error('[mail] developer lead notification failed:', (err as Error).message);
      }
    }

    try {
      await sendMail({
        ...developerLeadThankYouEmail(lead.toObject(), {
          name: settings.developer.name ?? '',
          email: devEmail,
          whatsapp: settings.developer.whatsapp ?? '',
          portfolioUrl: settings.developer.portfolioUrl ?? '',
        }),
        to: lead.email,
        replyTo: devEmail || undefined,
      });
    } catch (err) {
      console.error('[mail] developer lead thank-you failed:', (err as Error).message);
    }

    res.status(201).json({ ok: true });
  }),
);

adminDeveloperLeads.use(requireAuth);

adminDeveloperLeads.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await DeveloperLead.find().sort({ createdAt: -1 }).limit(200).lean();
    res.json({ items, unread: items.filter((l) => l.status === 'new').length });
  }),
);

adminDeveloperLeads.put(
  '/:id',
  validateBody(z.object({ status: z.enum(DEV_LEAD_STATUSES) })),
  asyncHandler(async (req, res) => {
    const item = await DeveloperLead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  }),
);

adminDeveloperLeads.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await DeveloperLead.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }),
);
