import { Schema, model } from 'mongoose';
export const ADMIN_ROLES = ['developer', 'owner'];
const adminUserSchema = new Schema({
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ADMIN_ROLES, required: true },
}, { timestamps: true });
adminUserSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.passwordHash;
        return ret;
    },
});
export const AdminUser = model('AdminUser', adminUserSchema);
