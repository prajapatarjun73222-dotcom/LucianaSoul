import { Schema, model } from 'mongoose';

export const ENQUIRY_TYPES = ['general', 'bespoke', 'collection', 'collaboration', 'textiles', 'other'] as const;
export const ENQUIRY_STATUSES = ['new', 'read', 'replied', 'archived'] as const;
export const CONTACT_METHODS = ['email', 'phone', 'whatsapp'] as const;

const enquirySchema = new Schema(
  {
    type: { type: String, enum: ENQUIRY_TYPES, default: 'general' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    message: { type: String, default: '' },
    designIdea: { type: String, default: '' },
    preferredContact: { type: String, enum: CONTACT_METHODS, default: 'email' },
    measurements: { type: String, default: '' },
    referenceImageUrl: { type: String, default: '' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, default: '' },
    status: { type: String, enum: ENQUIRY_STATUSES, default: 'new' },
    notes: { type: String, default: '' },
    emailNotified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

enquirySchema.index({ createdAt: -1 });

export const Enquiry = model('Enquiry', enquirySchema);
