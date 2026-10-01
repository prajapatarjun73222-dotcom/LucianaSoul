import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AdminUser } from '../models/AdminUser.js';
import { requireAuth, requireDeveloper } from '../middleware/auth.js';
import { asyncHandler, validateBody } from '../middleware/validate.js';

const router = Router();
router.use(requireAuth, requireDeveloper);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await AdminUser.find().sort({ role: 1, createdAt: 1 }));
  }),
);

const ownerSchema = z.object({
  email: z.string().email(),
  name: z.string().optional().default(''),
  password: z.string().min(8),
});

// Exactly one owner account: creates it, or replaces its credentials if it already exists.
router.put(
  '/owner',
  validateBody(ownerSchema),
  asyncHandler(async (req, res) => {
    const { email, name, password } = req.body as z.infer<typeof ownerSchema>;
    const clash = await AdminUser.findOne({ email: email.toLowerCase(), role: 'developer' });
    if (clash) return res.status(400).json({ error: 'That email belongs to the developer account' });
    const passwordHash = await bcrypt.hash(password, 12);
    const owner = await AdminUser.findOneAndUpdate(
      { role: 'owner' },
      { email: email.toLowerCase(), name, passwordHash, role: 'owner' },
      { upsert: true, new: true, runValidators: true },
    );
    res.json(owner);
  }),
);

router.delete(
  '/owner',
  asyncHandler(async (_req, res) => {
    await AdminUser.deleteOne({ role: 'owner' });
    res.json({ ok: true });
  }),
);

export default router;
