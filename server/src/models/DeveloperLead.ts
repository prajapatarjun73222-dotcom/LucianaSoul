import { Schema, model } from 'mongoose';

export const DEV_SERVICES = ['new_website', 'redesign', 'bug_fix', 'maintenance', 'other'] as const;
export const DEV_LEAD_STATUSES = ['new', 'contacted', 'archived'] as const;

const developerLeadSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    whatsapp: { type: String, trim: true, default: '' },
    service: { type: String, enum: DEV_SERVICES, default: 'new_website' },
    message: { type: String, default: '' },
    status: { type: String, enum: DEV_LEAD_STATUSES, default: 'new' },
    emailNotified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

developerLeadSchema.index({ createdAt: -1 });

export const DeveloperLead = model('DeveloperLead', developerLeadSchema);
