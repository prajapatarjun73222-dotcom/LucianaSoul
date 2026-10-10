import { Schema, model } from 'mongoose';
export const MEDIA_TYPES = ['image', 'video'];
export const MEDIA_KINDS = ['image', 'video', 'instagram_post', 'instagram_reel', 'external_video'];
export const MEDIA_SOURCES = ['instagram', 'google_maps', 'client', 'external'];
export const MEDIA_CATEGORIES = [
    'collection',
    'product',
    'homepage',
    'instagram',
    'blog',
    'bespoke',
    'sustainability',
    'studio',
    'fabric',
    'other',
];
const mediaSchema = new Schema({
    type: { type: String, enum: MEDIA_TYPES, required: true, default: 'image' },
    kind: { type: String, enum: MEDIA_KINDS, required: true, default: 'image' },
    source: { type: String, enum: MEDIA_SOURCES, required: true, default: 'client' },
    url: { type: String, required: true, trim: true },
    embedUrl: { type: String, trim: true, default: '' },
    thumbnailUrl: { type: String, trim: true, default: '' },
    title: { type: String, trim: true, default: '' },
    caption: { type: String, trim: true, default: '' },
    alt: { type: String, trim: true, default: '' },
    category: { type: String, enum: MEDIA_CATEGORIES, default: 'other' },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
}, { timestamps: true });
mediaSchema.index({ sortOrder: 1, createdAt: -1 });
export const Media = model('Media', mediaSchema);
