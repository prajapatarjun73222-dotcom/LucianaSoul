export type MediaKind = 'image' | 'video' | 'instagram_post' | 'instagram_reel' | 'external_video';
export type MediaSource = 'instagram' | 'google_maps' | 'client' | 'external';

export interface Media {
  _id: string;
  type: 'image' | 'video';
  kind: MediaKind;
  source: MediaSource;
  url: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  caption?: string;
  alt?: string;
  category?: string;
  featured?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type Availability = 'AVAILABLE' | 'MADE_TO_ORDER' | 'BESPOKE' | 'SOLD' | 'ARCHIVE' | 'ENQUIRE';

export interface ProductMediaRef {
  mediaId: Media | null;
  role: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  story?: string;
  category: string;
  categories?: string[];
  materials?: string;
  dimensions?: string;
  designDetails?: string;
  availability: Availability;
  price?: number;
  priceDisplay?: string;
  featured?: boolean;
  sortOrder?: number;
  media: ProductMediaRef[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  related?: Product[];
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverMedia?: Media | null;
  category: string;
  published: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  more?: BlogPost[];
}

export type EnquiryType = 'general' | 'bespoke' | 'collection' | 'collaboration' | 'textiles' | 'other';

export interface Enquiry {
  _id: string;
  type: EnquiryType;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  designIdea?: string;
  preferredContact?: string;
  measurements?: string;
  referenceImageUrl?: string;
  productId?: string;
  productName?: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  notes?: string;
  emailNotified?: boolean;
  createdAt: string;
}

export const HOMEPAGE_SLOTS = [
  'hero',
  'featuredCollection',
  'instagram',
  'sustainability',
  'bespoke',
  'footerGallery',
] as const;
export type HomepageSlot = (typeof HOMEPAGE_SLOTS)[number];

export interface CollectionCategory {
  key: string;
  label: string;
  visible: boolean;
}

export interface SiteSettings {
  homepage: Record<HomepageSlot, Media[]>;
  about: {
    designer?: string;
    philosophy?: string;
    upcycling?: string;
    bespoke?: string;
    london?: string;
    designerMedia?: Media | null;
  };
  sustainabilityText?: string;
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    addressLines: string[];
    instagram: string;
    googleMapsUrl?: string;
  };
  seo: { title: string; description: string; ogImage?: string };
  collectionCategories: CollectionCategory[];
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface AdminUser {
  _id: string;
  email: string;
  name?: string;
  role: 'developer' | 'owner';
}
