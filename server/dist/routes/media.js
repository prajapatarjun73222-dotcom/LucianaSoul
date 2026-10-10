import { Router } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Media, MEDIA_CATEGORIES, MEDIA_KINDS, MEDIA_SOURCES } from '../models/Media.js';
import { Product } from '../models/Product.js';
import { BlogPost } from '../models/BlogPost.js';
import { getSettings, HOMEPAGE_SLOTS } from '../models/Settings.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, validateBody } from '../middleware/validate.js';
import { normaliseMedia } from '../utils/media.js';
const router = Router();
const mediaSchema = z.object({
    kind: z.enum(MEDIA_KINDS),
    type: z.enum(['image', 'video']).optional(),
    source: z.enum(MEDIA_SOURCES),
    url: z.string().url(),
    embedUrl: z.string().url().or(z.literal('')).optional(),
    thumbnailUrl: z.string().url().or(z.literal('')).optional(),
    title: z.string().max(200).optional(),
    caption: z.string().max(2000).optional(),
    alt: z.string().max(300).optional(),
    category: z.enum(MEDIA_CATEGORIES).optional(),
    featured: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
});
async function usedIds(usage) {
    if (usage === 'products') {
        const products = await Product.find({}, { media: 1 }).lean();
        return products.flatMap((p) => p.media.map((m) => m.mediaId));
    }
    if (usage === 'blog') {
        const posts = await BlogPost.find({ coverMedia: { $exists: true } }, { coverMedia: 1 }).lean();
        return posts.map((p) => p.coverMedia);
    }
    if (usage === 'homepage') {
        const settings = await getSettings();
        return HOMEPAGE_SLOTS.flatMap((slot) => (settings.homepage?.[slot] ?? []));
    }
    return [];
}
router.get('/', asyncHandler(async (req, res) => {
    const { source, category, kind, featured, usage, ids } = req.query;
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 60)));
    const filter = {};
    if (source)
        filter.source = source;
    if (category)
        filter.category = category;
    if (kind)
        filter.kind = kind;
    if (featured === 'true')
        filter.featured = true;
    if (ids)
        filter._id = { $in: ids.split(',').filter((id) => Types.ObjectId.isValid(id)) };
    if (usage)
        filter._id = { $in: await usedIds(usage) };
    const [items, total] = await Promise.all([
        Media.find(filter)
            .sort({ sortOrder: 1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Media.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
}));
router.put('/reorder', requireAuth, validateBody(z.object({ ids: z.array(z.string()) })), asyncHandler(async (req, res) => {
    const ids = req.body.ids;
    await Media.bulkWrite(ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { sortOrder: index } } })));
    res.json({ ok: true });
}));
router.get('/:id', asyncHandler(async (req, res) => {
    if (!Types.ObjectId.isValid(req.params.id))
        return res.status(404).json({ error: 'Not found' });
    const item = await Media.findById(req.params.id).lean();
    if (!item)
        return res.status(404).json({ error: 'Not found' });
    res.json(item);
}));
router.post('/', requireAuth, validateBody(mediaSchema), asyncHandler(async (req, res) => {
    const item = await Media.create(normaliseMedia(req.body));
    res.status(201).json(item);
}));
router.put('/:id', requireAuth, validateBody(mediaSchema.partial()), asyncHandler(async (req, res) => {
    const existing = await Media.findById(req.params.id);
    if (!existing)
        return res.status(404).json({ error: 'Not found' });
    const merged = normaliseMedia({ ...existing.toObject(), ...req.body, type: req.body.type });
    existing.set(merged);
    await existing.save();
    res.json(existing);
}));
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
    const id = req.params.id;
    await Media.findByIdAndDelete(id);
    // Remove dangling references so pages never point at deleted media.
    const unset = Object.fromEntries(HOMEPAGE_SLOTS.map((slot) => [`homepage.${slot}`, id]));
    await Promise.all([
        Product.updateMany({}, { $pull: { media: { mediaId: id } } }),
        BlogPost.updateMany({ coverMedia: id }, { $unset: { coverMedia: 1 } }),
        (await getSettings()).updateOne({ $pull: unset }),
    ]);
    res.json({ ok: true });
}));
export default router;
