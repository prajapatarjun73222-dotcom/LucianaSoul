import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import MediaView, { posterOf } from '../components/MediaView';
import Reveal from '../components/Reveal';
import EditorialPiece, { heroMedia } from '../components/EditorialPiece';
import WhatsAppButton from '../components/WhatsAppButton';
import { BotanicalDivider } from '../components/Botanical';
import { WhatsAppIcon } from '../components/Icons';
import { useFetch } from '../lib/useFetch';
import { useSettings } from '../lib/settings';
import { whatsappLink, waMessages } from '../lib/whatsapp';
import { AVAILABILITY_LABELS, PRODUCT_CATEGORY_LABELS, displayName } from '../lib/labels';
import type { Media, Product } from '../types';
import NotFound from './NotFound';

const SCHEMA_AVAILABILITY: Record<string, string> = {
  AVAILABLE: 'https://schema.org/InStock',
  MADE_TO_ORDER: 'https://schema.org/PreOrder',
  BESPOKE: 'https://schema.org/PreOrder',
  SOLD: 'https://schema.org/SoldOut',
  ARCHIVE: 'https://schema.org/Discontinued',
  ENQUIRE: 'https://schema.org/LimitedAvailability',
};

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: product, loading, error } = useFetch<Product>(`/products/${slug}`);
  const { contact } = useSettings();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => setActiveId(null), [slug]);

  if (error) return <NotFound />;
  if (loading || !product) {
    return (
      <div className="container-editorial grid gap-10 py-10 lg:grid-cols-12">
        <div className="skeleton lg:col-span-7" style={{ aspectRatio: '4/5' }} />
        <div className="space-y-4 lg:col-span-4 lg:col-start-9">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-14 w-3/4" />
          <div className="skeleton h-24 w-full" />
        </div>
      </div>
    );
  }

  const name = displayName(product.name);
  const gallery = product.media.map((m) => m.mediaId).filter((m): m is Media => Boolean(m));
  const images = gallery.filter((m) => m.kind === 'image' || m.kind === 'instagram_post');
  const videos = gallery.filter((m) => m.type === 'video' || m.kind === 'instagram_reel' || m.kind === 'external_video');
  const hero = gallery.find((m) => m._id === activeId) ?? heroMedia(product);
  const editorial = product.media.find((m) => m.role === 'editorial' || m.role === 'studio')?.mediaId ?? images[1] ?? null;
  const categories = [product.category, ...(product.categories ?? [])].filter((c, i, a) => a.indexOf(c) === i);
  const sold = product.availability === 'SOLD' || product.availability === 'ARCHIVE';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: product.description || product.story || undefined,
    image: images.map(posterOf).filter(Boolean),
    brand: { '@type': 'Brand', name: 'LucianaSoul' },
    category: PRODUCT_CATEGORY_LABELS[product.category],
    material: product.materials || undefined,
    ...(product.price
      ? {
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'GBP',
            availability: SCHEMA_AVAILABILITY[product.availability],
          },
        }
      : {}),
  };

  return (
    <>
      <Seo title={name} description={product.description} image={posterOf(hero) || undefined} type="product" jsonLd={jsonLd} />

      <nav className="container-editorial pt-6 text-xs text-taupe" aria-label="Breadcrumb">
        <Link to="/collection" className="link-underline">
          The Collection
        </Link>
        <span className="mx-2">/</span>
        <span className="text-deep">{name}</span>
      </nav>

      <section className="container-editorial grid gap-10 pb-16 pt-6 lg:grid-cols-12 lg:gap-12">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="animate-fadeIn" key={hero?._id}>
            <MediaView media={hero} ratio="4/5" eager interactive sizes="(min-width: 1024px) 58vw, 100vw" />
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {gallery.map((m) => (
                <button
                  key={m._id}
                  type="button"
                  onClick={() => setActiveId(m._id)}
                  aria-label={`Show ${m.alt || m.title || 'image'}`}
                  className={`relative transition-opacity ${hero?._id === m._id ? 'opacity-100 outline outline-1 outline-offset-2 outline-ink' : 'opacity-70 hover:opacity-100'}`}
                >
                  <MediaView media={{ ...m, kind: 'image', url: posterOf(m) }} ratio="3/4" sizes="120px" />
                  {m.type === 'video' && <span className="label absolute bottom-1 left-1 bg-cream/90 px-1.5 py-0.5 text-[9px]">Video</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-4 lg:col-start-9">
          <div className="lg:sticky lg:top-28">
            <p className="label text-taupe">
              {categories.map((c) => PRODUCT_CATEGORY_LABELS[c] ?? c).join(' / ')}
            </p>
            <h1 className="display mt-4 text-5xl text-ink sm:text-6xl">{name}</h1>
            {product.description && <p className="mt-6 leading-relaxed text-deep">{product.description}</p>}
            {(product.categories?.includes('upcycled') || product.category === 'upcycled') && (
              <p className="mt-6 font-serif text-xl italic leading-snug text-deep">
                Created from carefully selected reused textiles, each piece carries its own character.
              </p>
            )}

            <dl className="mt-10 divide-y divide-taupe/30 border-y border-taupe/30">
              {product.materials && (
                <div className="grid grid-cols-3 gap-4 py-4">
                  <dt className="label text-taupe">Materials</dt>
                  <dd className="col-span-2 text-sm text-ink">{product.materials}</dd>
                </div>
              )}
              {product.dimensions && (
                <div className="grid grid-cols-3 gap-4 py-4">
                  <dt className="label text-taupe">Size</dt>
                  <dd className="col-span-2 text-sm text-ink">{product.dimensions}</dd>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4 py-4">
                <dt className="label text-taupe">Availability</dt>
                <dd className="col-span-2 text-sm text-ink">{AVAILABILITY_LABELS[product.availability]}</dd>
              </div>
              {product.priceDisplay && (
                <div className="grid grid-cols-3 gap-4 py-4">
                  <dt className="label text-taupe">Price</dt>
                  <dd className="col-span-2 text-sm text-ink">{product.priceDisplay}</dd>
                </div>
              )}
            </dl>

            <div className="mt-8 flex flex-col gap-3">
              <Link to={`/enquiry?product=${product._id}&type=collection`} className="btn-primary">
                {sold ? 'Enquire about a similar piece' : 'Enquire about this piece'}
              </Link>
              <WhatsAppButton message={waMessages.piece(name)} label="Chat about this piece" />
              {!sold && (
                <WhatsAppButton
                  variant="text"
                  className="mt-2 self-center"
                  message={waMessages.availability(name)}
                  label="Ask about availability"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {(product.story || product.designDetails) && (
        <section className="bg-sand py-20 lg:py-28">
          <div className="container-editorial grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <p className="label text-taupe">Product story</p>
              <h2 className="display mt-4 text-5xl sm:text-6xl">The story</h2>
              <BotanicalDivider className="mt-8 h-6 w-36 text-taupe" />
            </Reveal>
            <Reveal className="space-y-10 lg:col-span-6 lg:col-start-7" delay={100}>
              {product.story && <p className="whitespace-pre-line font-serif text-2xl leading-relaxed text-ink">{product.story}</p>}
              {product.designDetails && (
                <div>
                  <p className="label mb-3 text-taupe">Design details</p>
                  <p className="whitespace-pre-line leading-relaxed text-deep">{product.designDetails}</p>
                </div>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {editorial && (
        <section className="my-16">
          <Reveal variant="image">
            <MediaView media={editorial} ratio="16/9" sizes="100vw" className="max-h-[85vh]" />
          </Reveal>
        </section>
      )}

      {videos.length > 0 && (
        <section className="container-editorial py-12">
          <p className="label mb-6 text-taupe">In motion</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <MediaView key={v._id} media={v} ratio="9/16" interactive sizes="(min-width: 1024px) 33vw, 100vw" />
            ))}
          </div>
        </section>
      )}

      {product.related && product.related.length > 0 && (
        <section className="container-editorial py-20">
          <h2 className="display mb-12 text-4xl sm:text-5xl">You may also like</h2>
          <div className="grid gap-10 md:grid-cols-3">
            {product.related.map((p, i) => (
              <EditorialPiece key={p._id} product={p} ratio={i === 1 ? '3/4' : '4/5'} className={i === 1 ? 'md:mt-16' : ''} sizes="(min-width: 768px) 33vw, 100vw" />
            ))}
          </div>
        </section>
      )}

      {/* Piece-specific mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-taupe/30 bg-cream/95 backdrop-blur-sm lg:hidden">
        <Link to={`/enquiry?product=${product._id}&type=collection`} className="label flex h-14 items-center justify-center text-ink">
          Enquire
        </Link>
        <a
          href={whatsappLink(contact.whatsapp, waMessages.piece(name))}
          target="_blank"
          rel="noopener noreferrer"
          className="label flex h-14 items-center justify-center gap-2 bg-ink text-cream"
        >
          <WhatsAppIcon /> WhatsApp
        </a>
      </div>
    </>
  );
}
