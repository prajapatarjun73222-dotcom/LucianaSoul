/**
 * Development seed. Creates site settings with the real contact details and a small set of
 * clearly labelled placeholder media/products so the site can be previewed before
 * LucianaSoul's own photography is added through the admin panel.
 *
 * Usage: npm run seed            (only seeds when there is no media yet)
 *        npm run seed -- --reset  (removes previous placeholders first)
 */
import mongoose from 'mongoose';
import { connectDb } from './db.js';
import { Media } from './models/Media.js';
import { Product } from './models/Product.js';
import { BlogPost } from './models/BlogPost.js';
import { getSettings } from './models/Settings.js';
import { ensureDeveloperAccount } from './services/ensureDeveloper.js';

const P = '[Placeholder]';

/** Real LucianaSoul photography, linked (not re-hosted) from the business's Google Maps listing. */
const REAL_MEDIA = [
  {
    kind: 'image',
    type: 'image',
    source: 'google_maps',
    url: 'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9S_sI8gCT9jMPP1D6GqREiK1cRedC1R9Rdkb_3HvzawW07FEEfPegbCgC_UuHMPf6uCRsa8X5O8vSTa59VKMs3nGlt1J-aKB_m9LDFeX0yTF22eforMbxHu9PUiKkbc2-pIVa97jg=w1600-h2000-k-no',
    title: 'Up-cycled print dress and two-piece in the studio',
    alt: 'Two LucianaSoul up-cycled pieces in a bold red and ochre print, a dress and a wrap top with shorts, styled on dress forms in the studio',
    category: 'homepage',
    featured: true,
    sortOrder: -1,
  },
] as const;
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

const placeholderMedia = [
  { key: 'hero', id: 'photo-1515886657613-9f3515b0c78f', title: 'Hero portrait', category: 'homepage' },
  { key: 'dress1', id: 'photo-1490481651871-ab68de25d43d', title: 'Editorial portrait', category: 'collection' },
  { key: 'dress2', id: 'photo-1509631179647-0177331693ae', title: 'Studio look', category: 'collection' },
  { key: 'rail', id: 'photo-1445205170230-053b83016050', title: 'Clothing rail', category: 'studio' },
  { key: 'look3', id: 'photo-1539109136881-3be0616acf4b', title: 'Full-length look', category: 'collection' },
  { key: 'look4', id: 'photo-1485968579580-b6d095142e6e', title: 'Outdoor look', category: 'collection' },
  { key: 'fabric', id: 'photo-1558769132-cb1aea458c5e', title: 'Fabric detail', category: 'fabric' },
  { key: 'look5', id: 'photo-1524041255072-7da0525d6b34', title: 'Portrait look', category: 'collection' },
  { key: 'look6', id: 'photo-1496747611176-843222e1e57c', title: 'Dress detail', category: 'product' },
  { key: 'studio', id: 'photo-1581044777550-4cfa60707c03', title: 'Studio moment', category: 'studio' },
  { key: 'look7', id: 'photo-1469334031218-e382a71b716b', title: 'Movement', category: 'instagram' },
  { key: 'look8', id: 'photo-1487222477894-8943e31ef7b2', title: 'Accessories', category: 'instagram' },
] as const;

async function run() {
  await connectDb();
  await ensureDeveloperAccount();
  const reset = process.argv.includes('--reset');

  if (reset) {
    const old = await Media.find({ title: { $regex: '^\\[Placeholder\\]' } }, { _id: 1 });
    const ids = old.map((m) => m._id);
    await Media.deleteMany({ _id: { $in: ids } });
    await Product.deleteMany({ name: { $regex: '^\\[Placeholder\\]' } });
    await BlogPost.deleteMany({ title: { $regex: '^\\[Placeholder\\]' } });
    console.log(`[seed] removed ${ids.length} placeholder media items`);
  } else if ((await Media.countDocuments({ url: { $nin: REAL_MEDIA.map((m) => m.url) } })) > 0) {
    console.log('[seed] media already exists; nothing to do (use --reset to replace placeholders)');
    await mongoose.disconnect();
    return;
  }

  const settings = await getSettings();

  const realIds: mongoose.Types.ObjectId[] = [];
  for (const item of REAL_MEDIA) {
    const doc = (await Media.findOne({ url: item.url })) ?? (await Media.create(item));
    realIds.push(doc._id);
  }

  const created: Record<string, mongoose.Types.ObjectId> = {};
  for (const [index, m] of placeholderMedia.entries()) {
    const doc = await Media.create({
      type: 'image',
      kind: 'image',
      source: 'external',
      url: img(m.id),
      title: `${P} ${m.title}`,
      caption: 'Development placeholder. Replace with LucianaSoul imagery in Admin, Media.',
      alt: `${m.title} (placeholder image)`,
      category: m.category,
      featured: index < 6,
      sortOrder: index,
    });
    created[m.key] = doc._id;
  }

  const reel = await Media.create({
    type: 'video',
    kind: 'instagram_reel',
    source: 'instagram',
    url: 'https://www.instagram.com/luciana_soul/',
    thumbnailUrl: img('photo-1581044777550-4cfa60707c03'),
    title: `${P} Instagram reel`,
    caption: 'Replace with a real Reel URL, e.g. https://www.instagram.com/reel/...',
    alt: 'Studio reel (placeholder)',
    category: 'instagram',
    sortOrder: 99,
  });

  const products = [
    {
      name: `${P} The Botanical Dress`,
      category: 'upcycled',
      categories: ['upcycled', 'dresses', 'womenswear'],
      availability: 'ENQUIRE',
      featured: true,
      media: [
        { mediaId: created.dress1, role: 'hero' },
        { mediaId: created.look6, role: 'detail' },
        { mediaId: created.fabric, role: 'fabric' },
        { mediaId: reel._id, role: 'reel' },
      ],
    },
    {
      name: `${P} Bespoke Evening Piece`,
      category: 'bespoke',
      categories: ['bespoke', 'womenswear'],
      availability: 'BESPOKE',
      featured: true,
      media: [
        { mediaId: created.dress2, role: 'hero' },
        { mediaId: created.studio, role: 'studio' },
      ],
    },
    {
      name: `${P} Up-cycled Day Dress`,
      category: 'dresses',
      categories: ['dresses', 'upcycled'],
      availability: 'MADE_TO_ORDER',
      featured: true,
      media: [{ mediaId: created.look3, role: 'hero' }],
    },
    {
      name: `${P} Textile Study`,
      category: 'textiles',
      categories: ['textiles'],
      availability: 'ENQUIRE',
      media: [{ mediaId: created.fabric, role: 'hero' }],
    },
    {
      name: `${P} Archive Look`,
      category: 'archive',
      categories: ['archive', 'womenswear'],
      availability: 'ARCHIVE',
      media: [{ mediaId: created.look4, role: 'hero' }],
    },
    {
      name: `${P} Portrait Piece`,
      category: 'womenswear',
      categories: ['womenswear'],
      availability: 'ENQUIRE',
      media: [{ mediaId: created.look5, role: 'hero' }],
    },
  ];

  for (const [index, p] of products.entries()) {
    await Product.create({
      ...p,
      slug: p.name.replace(P, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description: 'Placeholder description. Edit this piece in Admin, Products.',
      story: 'Placeholder story. Add the real story behind this piece in Admin, Products.',
      materials: 'Add materials in Admin, Products.',
      sortOrder: index,
    });
  }

  await BlogPost.create({
    title: `${P} A first journal entry`,
    slug: 'a-first-journal-entry',
    excerpt: 'Placeholder entry. Write real journal posts in Admin, Blog.',
    content:
      'This is a placeholder journal post used during development.\n\nReplace it with real stories from the LucianaSoul studio in **Admin, Blog**.',
    category: 'design-stories',
    coverMedia: created.rail,
    published: true,
  });

  settings.set('homepage', {
    hero: [...realIds, created.hero],
    featuredCollection: [created.dress1, created.dress2, created.look3, created.fabric, created.look4, created.look5],
    instagram: [created.look7, reel._id, created.studio, created.look8, created.look6, created.rail],
    sustainability: [created.fabric, created.rail],
    bespoke: [created.studio],
    footerGallery: [created.look5, created.look7, created.fabric, created.look8],
  });
  await settings.save();

  console.log('[seed] placeholder content created');
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
