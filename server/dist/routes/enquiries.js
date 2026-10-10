import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Enquiry, CONTACT_METHODS, ENQUIRY_STATUSES, ENQUIRY_TYPES } from '../models/Enquiry.js';
import { Product } from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, validateBody } from '../middleware/validate.js';
import { enquiryEmail, sendMail } from '../services/mailer.js';
export const publicEnquiries = Router();
export const adminEnquiries = Router();
const enquiryLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 15, standardHeaders: true, legacyHeaders: false });
const enquirySchema = z.object({
    type: z.enum(ENQUIRY_TYPES).default('general'),
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().max(40).optional().default(''),
    message: z.string().max(5000).optional().default(''),
    designIdea: z.string().max(5000).optional().default(''),
    preferredContact: z.enum(CONTACT_METHODS).optional().default('email'),
    measurements: z.string().max(3000).optional().default(''),
    referenceImageUrl: z.string().url().max(1000).or(z.literal('')).optional().default(''),
    productId: z
        .string()
        .refine((v) => Types.ObjectId.isValid(v))
        .optional(),
    website: z.string().optional(), // honeypot
});
publicEnquiries.post('/', enquiryLimiter, validateBody(enquirySchema), asyncHandler(async (req, res) => {
    const { website, ...body } = req.body;
    if (website)
        return res.status(201).json({ ok: true });
    if (!body.message && !body.designIdea) {
        return res.status(400).json({ error: 'Please tell us a little about your enquiry.' });
    }
    let productName = '';
    if (body.productId) {
        const product = await Product.findById(body.productId, { name: 1 }).lean();
        productName = product?.name ?? '';
    }
    const enquiry = await Enquiry.create({ ...body, productName });
    try {
        const mail = enquiryEmail(enquiry.toObject());
        const result = await sendMail({ ...mail, replyTo: enquiry.email });
        if (result.sent)
            await Enquiry.updateOne({ _id: enquiry._id }, { emailNotified: true });
    }
    catch (err) {
        console.error('[mail] enquiry notification failed:', err.message);
    }
    res.status(201).json({ ok: true, id: enquiry._id });
}));
adminEnquiries.use(requireAuth);
adminEnquiries.get('/', asyncHandler(async (req, res) => {
    const { status, type } = req.query;
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 30)));
    const filter = {};
    if (status)
        filter.status = status;
    if (type)
        filter.type = type;
    const [items, total, unread] = await Promise.all([
        Enquiry.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Enquiry.countDocuments(filter),
        Enquiry.countDocuments({ status: 'new' }),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit), unread });
}));
adminEnquiries.put('/:id', validateBody(z.object({ status: z.enum(ENQUIRY_STATUSES).optional(), notes: z.string().max(5000).optional() })), asyncHandler(async (req, res) => {
    const item = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item)
        return res.status(404).json({ error: 'Not found' });
    res.json(item);
}));
adminEnquiries.delete('/:id', asyncHandler(async (req, res) => {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
}));
