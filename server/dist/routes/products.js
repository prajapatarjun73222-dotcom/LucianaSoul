import { Router } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Product, AVAILABILITY, PRODUCT_CATEGORIES, MEDIA_ROLES } from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, validateBody } from '../middleware/validate.js';
import { slugify } from '../utils/media.js';
const router = Router();
const productSchema = z.object({
    name: z.string().min(1).max(200),
    slug: z.string().max(100).optional(),
    description: z.string().optional(),
    story: z.string().optional(),
    category: z.enum(PRODUCT_CATEGORIES),
    categories: z.array(z.enum(PRODUCT_CATEGORIES)).optional(),
    materials: z.string().optional(),
    dimensions: z.string().optional(),
    designDetails: z.string().optional(),
    availability: z.enum(AVAILABILITY),
    price: z.number().nonnegative().nullable().optional(),
    priceDisplay: z.string().optional(),
    featured: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    media: z
        .array(z.object({ mediaId: z.string().refine((v) => Types.ObjectId.isValid(v)), role: z.enum(MEDIA_ROLES) }))
        .optional(),
    tags: z.array(z.string()).optional(),
});
const populateMedia = { path: 'media.mediaId' };
function categoryFilter(category) {
    if (!category || category === 'all')
        return {};
    return { $or: [{ category }, { categories: category }] };
}
router.get('/', asyncHandler(async (req, res) => {
    const { category, featured } = req.query;
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 12)));
    const filter = { ...categoryFilter(category) };
    if (featured === 'true')
        filter.featured = true;
    const [items, total] = await Promise.all([
        Product.find(filter)
            .sort({ sortOrder: 1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate(populateMedia)
            .lean(),
        Product.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
}));
router.put('/reorder', requireAuth, validateBody(z.object({ ids: z.array(z.string()) })), asyncHandler(async (req, res) => {
    const ids = req.body.ids;
    await Product.bulkWrite(ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { sortOrder: index } } })));
    res.json({ ok: true });
}));
router.get('/id/:id', asyncHandler(async (req, res) => {
    if (!Types.ObjectId.isValid(req.params.id))
        return res.status(404).json({ error: 'Not found' });
    const item = await Product.findById(req.params.id).populate(populateMedia).lean();
    if (!item)
        return res.status(404).json({ error: 'Not found' });
    res.json(item);
}));
router.get('/:slug', asyncHandler(async (req, res) => {
    const item = await Product.findOne({ slug: req.params.slug }).populate(populateMedia).lean();
    if (!item)
        return res.status(404).json({ error: 'Not found' });
    const related = await Product.find({ _id: { $ne: item._id }, ...categoryFilter(item.category) })
        .sort({ featured: -1, sortOrder: 1 })
        .limit(3)
        .populate(populateMedia)
        .lean();
    if (related.length < 3) {
        const more = await Product.find({ _id: { $nin: [item._id, ...related.map((r) => r._id)] } })
            .sort({ featured: -1, sortOrder: 1 })
            .limit(3 - related.length)
            .populate(populateMedia)
            .lean();
        related.push(...more);
    }
    res.json({ ...item, related });
}));
async function uniqueSlug(base, excludeId) {
    const root = slugify(base) || 'piece';
    let slug = root;
    let n = 2;
    while (await Product.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
        slug = `${root}-${n++}`;
    }
    return slug;
}
router.post('/', requireAuth, validateBody(productSchema), asyncHandler(async (req, res) => {
    const body = req.body;
    const slug = await uniqueSlug(body.slug || body.name);
    const item = await Product.create({ ...body, price: body.price ?? undefined, slug });
    res.status(201).json(item);
}));
router.put('/:id', requireAuth, validateBody(productSchema.partial()), asyncHandler(async (req, res) => {
    const body = req.body;
    const update = { ...body };
    if (body.slug !== undefined || body.name !== undefined) {
        const current = await Product.findById(req.params.id);
        if (!current)
            return res.status(404).json({ error: 'Not found' });
        update.slug = await uniqueSlug(body.slug || current.slug || body.name || '', req.params.id);
    }
    const unset = {};
    if (body.price === null) {
        delete update.price;
        unset.price = 1;
    }
    const item = await Product.findByIdAndUpdate(req.params.id, { $set: update, ...(Object.keys(unset).length ? { $unset: unset } : {}) }, { new: true, runValidators: true });
    if (!item)
        return res.status(404).json({ error: 'Not found' });
    res.json(item);
}));
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
}));
export default router;
