import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { AdminUser } from '../models/AdminUser.js';

export async function ensureDeveloperAccount() {
  const { email, password, name } = config.admin;
  if (!email || !password) {
    console.warn('[auth] ADMIN_EMAIL / ADMIN_PASSWORD not set; developer account not seeded');
    return;
  }
  const existing = await AdminUser.findOne({ role: 'developer' });
  if (existing) return;
  await AdminUser.create({
    email: email.toLowerCase(),
    name,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'developer',
  });
  console.log(`[auth] developer account created for ${email}`);
}
