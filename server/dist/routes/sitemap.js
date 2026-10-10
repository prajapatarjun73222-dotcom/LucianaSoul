import { Router } from 'express';
import { config } from '../config.js';
import { Product } from '../models/Product.js';
import { BlogPost } from '../models/BlogPost.js';
import { asyncHandler } from '../middleware/validate.js';
const router = Router();
router.get('/sitemap.xml', asyncHandler(async (_req, res) => {
    const [products, posts] = await Promise.all([
        Product.find({}, { slug: 1, updatedAt: 1 }).lean(),
        BlogPost.find({ published: true }, { slug: 1, updatedAt: 1 }).lean(),
    ]);
    const staticPaths = ['/', '/about', '/collection', '/bespoke', '/journal', '/contact'];
    const urls = [
        ...staticPaths.map((p) => ({ loc: p, lastmod: undefined })),
        ...products.map((p) => ({ loc: `/collection/${p.slug}`, lastmod: p.updatedAt })),
        ...posts.map((p) => ({ loc: `/journal/${p.slug}`, lastmod: p.updatedAt })),
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
        .map((u) => `  <url><loc>${config.siteUrl}${u.loc}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}</url>`)
        .join('\n')}
</urlset>`;
    res.type('application/xml').send(xml);
}));
router.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
});
export default router;
