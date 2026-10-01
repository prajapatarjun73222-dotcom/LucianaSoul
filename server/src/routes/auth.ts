import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { AdminUser } from '../models/AdminUser.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { asyncHandler, validateBody } from '../middleware/validate.js';

const router = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

router.post(
  '/login',
  loginLimiter,
  validateBody(z.object({ email: z.string().email(), password: z.string().min(1) })),
  asyncHandler(async (req, res) => {
    const user = await AdminUser.findOne({ email: req.body.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
      return res.status(401).json({ error: 'Incorrect email or password' });
    }
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.json({ token, user });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await AdminUser.findById(req.admin!.sub);
    if (!user) return res.status(401).json({ error: 'Account no longer exists' });
    res.json({ user });
  }),
);

router.put(
  '/password',
  requireAuth,
  validateBody(z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) })),
  asyncHandler(async (req, res) => {
    const user = await AdminUser.findById(req.admin!.sub);
    if (!user || !(await bcrypt.compare(req.body.currentPassword, user.passwordHash))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await user.save();
    res.json({ ok: true });
  }),
);

export default router;
