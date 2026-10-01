import { Router } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { BlogPost, BLOG_CATEGORIES } from '../models/BlogPost.js';
import { requireAuth } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { asyncHandler, validateBody } from '../middleware/validate.js';
import { slugify } from '../utils/media.js';
const router = Router();
const blogSchema = z.object({
    title: z.string().min(1).max(200),
    slug: z.string().max(100).optional(),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    coverMedia: z
        .string()
        .refine((v) => Types.ObjectId.isValid(v))
        .nullable()
        .optional(),
    category: z.enum(BLOG_CATEGORIES),
    published: z.boolean().optional(),
    publishedAt: z.string().datetime().nullable().optional(),
});
async function uniqueSlug(base, excludeId) {
    const root = slugify(base) || 'post';
    let slug = root;
    let n = 2;
    while (await BlogPost.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
        slug = `${root}-${n++}`;
    }
    return slug;
}
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
    const { category, all } = req.query;
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 9)));
    const filter = {};
    if (!(all === 'true' && req.admin))
        filter.published = true;
    if (category && category !== 'all')
        filter.category = category;
    const [items, total] = await Promise.all([
        BlogPost.find(filter, { content: 0 })
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('coverMedia')
            .lean(),
        BlogPost.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
}));
router.get('/id/:id', requireAuth, asyncHandler(async (req, res) => {
    const item = await BlogPost.findById(req.params.id).populate('coverMedia').lean();
    if (!item)
        return res.status(404).json({ error: 'Not found' });
    res.json(item);
}));
router.get('/:slug', optionalAuth, asyncHandler(async (req, res) => {
    const filter = { slug: req.params.slug };
    if (!req.admin)
        filter.published = true;
    const item = await BlogPost.findOne(filter).populate('coverMedia').lean();
    if (!item)
        return res.status(404).json({ error: 'Not found' });
    const more = await BlogPost.find({ published: true, _id: { $ne: item._id } }, { content: 0 })
        .sort({ publishedAt: -1 })
        .limit(2)
        .populate('coverMedia')
        .lean();
    res.json({ ...item, more });
}));
function toDoc(body) {
    const doc = { ...body };
    const unset = {};
    if (body.coverMedia === null) {
        delete doc.coverMedia;
        unset.coverMedia = 1;
    }
    if (body.publishedAt === null) {
        delete doc.publishedAt;
        unset.publishedAt = 1;
    }
    return { doc, unset };
}
router.post('/', requireAuth, validateBody(blogSchema), asyncHandler(async (req, res) => {
    const body = req.body;
    const { doc } = toDoc(body);
    const item = new BlogPost({ ...doc, slug: await uniqueSlug(body.slug || body.title) });
    await item.save();
    res.status(201).json(item);
}));
router.put('/:id', requireAuth, validateBody(blogSchema.partial()), asyncHandler(async (req, res) => {
    const body = req.body;
    const item = await BlogPost.findById(req.params.id);
    if (!item)
        return res.status(404).json({ error: 'Not found' });
    const { doc, unset } = toDoc(body);
    if (body.slug !== undefined)
        doc.slug = await uniqueSlug(body.slug || item.title, req.params.id);
    item.set(doc);
    for (const key of Object.keys(unset))
        item.set(key, undefined);
    await item.save();
    res.json(item);
}));
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
}));
export default router;
