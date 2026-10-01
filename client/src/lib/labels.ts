import type { Availability } from '../types';

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  AVAILABLE: 'Available',
  MADE_TO_ORDER: 'Made to order',
  BESPOKE: 'Bespoke',
  SOLD: 'Sold',
  ARCHIVE: 'Archive',
  ENQUIRE: 'Enquire',
};

export const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  upcycled: 'Up-cycled',
  bespoke: 'Bespoke',
  dresses: 'Dresses',
  womenswear: 'Womenswear',
  menswear: 'Menswear',
  accessories: 'Accessories',
  textiles: 'Textiles',
  archive: 'Archive',
};

export const BLOG_CATEGORY_LABELS: Record<string, string> = {
  'design-stories': 'Design Stories',
  'up-cycling': 'Up-cycling',
  'fabric-stories': 'Fabric Stories',
  bespoke: 'Bespoke',
  'behind-the-scenes': 'Behind the Scenes',
  london: 'London',
};

export const ENQUIRY_TYPE_LABELS: Record<string, string> = {
  general: 'General enquiry',
  bespoke: 'Bespoke design',
  collection: 'Collection piece',
  collaboration: 'Collaboration',
  textiles: 'Textiles',
  other: 'Other',
};

export const SOURCE_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  google_maps: 'Google Maps',
  client: 'Client provided',
  external: 'Other external',
};

export const KIND_LABELS: Record<string, string> = {
  image: 'Image',
  video: 'Video',
  instagram_post: 'Instagram post',
  instagram_reel: 'Instagram Reel',
  external_video: 'External video',
};

export function formatDate(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Strip the dev "[Placeholder]" marker from public display. */
export function displayName(name: string) {
  return name.replace(/^\[Placeholder\]\s*/, '');
}
