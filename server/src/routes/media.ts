import { Router } from 'express';
import { Readable } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
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

async function usedIds(usage: string): Promise<Types.ObjectId[]> {
  if (usage === 'products') {
    const products = await Product.find({}, { media: 1 }).lean();
    return products.flatMap((p) => p.media.map((m) => m.mediaId as Types.ObjectId));
  }
  if (usage === 'blog') {
    const posts = await BlogPost.find({ coverMedia: { $exists: true } }, { coverMedia: 1 }).lean();
    return posts.map((p) => p.coverMedia as Types.ObjectId);
  }
  if (usage === 'homepage') {
    const settings = await getSettings();
    return HOMEPAGE_SLOTS.flatMap((slot) => (settings.homepage?.[slot] ?? []) as Types.ObjectId[]);
  }
  return [];
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { source, category, kind, featured, usage, ids } = req.query as Record<string, string | undefined>;
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 60)));

    const filter: Record<string, unknown> = {};
    if (source) filter.source = source;
    if (category) filter.category = category;
    if (kind) filter.kind = kind;
    if (featured === 'true') filter.featured = true;
    if (ids) filter._id = { $in: ids.split(',').filter((id) => Types.ObjectId.isValid(id)) };
    if (usage) filter._id = { $in: await usedIds(usage) };

    const [items, total] = await Promise.all([
      Media.find(filter)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  }),
);

router.put(
  '/reorder',
  requireAuth,
  validateBody(z.object({ ids: z.array(z.string()) })),
  asyncHandler(async (req, res) => {
    const ids: string[] = req.body.ids;
    await Media.bulkWrite(
      ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { sortOrder: index } } })),
    );
    res.json({ ok: true });
  }),
);

const DRIVE_FILE_ID = /^[a-zA-Z0-9_-]{10,}$/;

/** Streams a saved Drive video from our own address so the page can use a normal player. */
router.get(
  '/drive/:fileId',
  asyncHandler(async (req, res) => {
    const fileId = req.params.fileId;
    if (!DRIVE_FILE_ID.test(fileId)) return res.status(404).end();
    const saved = await Media.exists({
      url: { $regex: `(?:/d/|[?&]id=)${fileId}(?:[^A-Za-z0-9_-]|$)` },
    });
    if (!saved) return res.status(404).end();

    const headers: Record<string, string> = { 'User-Agent': 'LucianaSoul' };
    if (typeof req.headers.range === 'string') headers.Range = req.headers.range;
    const upstream = await fetch(
      `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download`,
      { headers, redirect: 'follow' },
    );
    const type = upstream.headers.get('content-type') ?? '';
    if ((!upstream.ok && upstream.status !== 206) || !type.startsWith('video/') || !upstream.body) {
      return res.status(502).end();
    }

    res.status(upstream.status);
    res.setHeader('Content-Type', type);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Accept-Ranges', upstream.headers.get('accept-ranges') ?? 'bytes');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    const length = upstream.headers.get('content-length');
    const range = upstream.headers.get('content-range');
    if (length) res.setHeader('Content-Length', length);
    if (range) res.setHeader('Content-Range', range);
    const stream = Readable.fromWeb(upstream.body as ReadableStream<Uint8Array>);
    stream.on('error', () => {
      if (!res.headersSent) res.status(502).end();
      else res.destroy();
    });
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Not found' });
    const item = await Media.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  }),
);

router.post(
  '/',
  requireAuth,
  validateBody(mediaSchema),
  asyncHandler(async (req, res) => {
    const item = await Media.create(normaliseMedia(req.body));
    res.status(201).json(item);
  }),
);

router.put(
  '/:id',
  requireAuth,
  validateBody(mediaSchema.partial()),
  asyncHandler(async (req, res) => {
    const existing = await Media.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const merged = normaliseMedia({ ...existing.toObject(), ...req.body, type: req.body.type });
    existing.set(merged);
    await existing.save();
    res.json(existing);
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
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
  }),
);

export default router;
