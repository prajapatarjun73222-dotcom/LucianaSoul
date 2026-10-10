import { Schema, model } from 'mongoose';

export const AVAILABILITY = ['AVAILABLE', 'MADE_TO_ORDER', 'BESPOKE', 'SOLD', 'ARCHIVE', 'ENQUIRE'] as const;
export const PRODUCT_CATEGORIES = [
  'upcycled',
  'bespoke',
  'dresses',
  'womenswear',
  'menswear',
  'accessories',
  'textiles',
  'archive',
] as const;
export const MEDIA_ROLES = ['hero', 'front', 'back', 'detail', 'fabric', 'reel', 'studio', 'editorial', 'other'] as const;

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
    story: { type: String, default: '' },
    category: { type: String, enum: PRODUCT_CATEGORIES, default: 'upcycled' },
    categories: [{ type: String, enum: PRODUCT_CATEGORIES }],
    materials: { type: String, default: '' },
    dimensions: { type: String, default: '' },
    designDetails: { type: String, default: '' },
    availability: { type: String, enum: AVAILABILITY, default: 'ENQUIRE' },
    price: { type: Number, required: false },
    priceDisplay: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    media: [
      {
        _id: false,
        mediaId: { type: Schema.Types.ObjectId, ref: 'Media', required: true },
        role: { type: String, enum: MEDIA_ROLES, default: 'other' },
      },
    ],
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

productSchema.index({ sortOrder: 1, createdAt: -1 });

export const Product = model('Product', productSchema);
