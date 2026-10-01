import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { connectDb } from './db.js';
import { ensureDeveloperAccount } from './services/ensureDeveloper.js';
import { startKeepAlive } from './services/keepAlive.js';
import authRoutes from './routes/auth.js';
import adminUserRoutes from './routes/adminUsers.js';
import mediaRoutes from './routes/media.js';
import productRoutes from './routes/products.js';
import blogRoutes from './routes/blog.js';
import { adminEnquiries, publicEnquiries } from './routes/enquiries.js';
import { adminSettings, publicSettings } from './routes/settings.js';
import sitemapRoutes from './routes/sitemap.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: config.clientOrigin.split(',').map((o) => o.trim()) }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/products', productRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/enquiries', publicEnquiries);
app.use('/api/admin/enquiries', adminEnquiries);
app.use('/api/settings', publicSettings);
app.use('/api/admin/settings', adminSettings);
app.use(sitemapRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Serve the built client in production.
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: '7d', index: false }));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use((err: Error & { code?: number }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.code === 11000) return res.status(409).json({ error: 'A record with that value already exists' });
  if (err.name === 'CastError' || err.name === 'ValidationError') return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

async function start() {
  await connectDb();
  await ensureDeveloperAccount();
  app.listen(config.port, () => {
    console.log(`[server] listening on http://localhost:${config.port}`);
    startKeepAlive();
  });
}

start().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
