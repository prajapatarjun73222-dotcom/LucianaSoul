import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { AVAILABILITY_LABELS, PRODUCT_CATEGORY_LABELS, displayName } from '../lib/labels';
import MediaView from './MediaView';
import Reveal from './Reveal';

export function heroMedia(product: Product) {
  const refs = product.media.filter((m) => m.mediaId);
  return (refs.find((m) => m.role === 'hero') ?? refs.find((m) => m.mediaId?.kind === 'image') ?? refs[0])?.mediaId ?? null;
}

export function secondaryMedia(product: Product) {
  const hero = heroMedia(product);
  return product.media.find((m) => m.mediaId && m.mediaId._id !== hero?._id && m.mediaId.kind === 'image')?.mediaId ?? null;
}

interface Props {
  product: Product;
  ratio: string;
  index?: number;
  sizes?: string;
  className?: string;
}

/** A collection piece presented like a magazine page: image first, quiet typographic caption. */
export default function EditorialPiece({ product, ratio, index, sizes, className = '' }: Props) {
  const hero = heroMedia(product);
  const alt = secondaryMedia(product);
  return (
    <Reveal className={className}>
      <Link to={`/collection/${product.slug}`} className="group block">
        <div className="relative overflow-hidden">
          <MediaView media={hero} ratio={ratio} sizes={sizes} className="zoom-hover" fallback={alt} />
          {alt && (
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-1000 group-hover:opacity-100">
              <MediaView media={alt} ratio={ratio} sizes={sizes} className="h-full" />
            </div>
          )}
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <div>
            {index !== undefined && <span className="label mr-3 text-taupe">{String(index + 1).padStart(2, '0')}</span>}
            <h3 className="inline font-serif text-2xl uppercase tracking-wide text-ink">{displayName(product.name)}</h3>
          </div>
          <span className="label shrink-0 text-taupe">
            {product.priceDisplay || AVAILABILITY_LABELS[product.availability]}
          </span>
        </div>
        <p className="label mt-1 text-taupe/80">{PRODUCT_CATEGORY_LABELS[product.category] ?? product.category}</p>
      </Link>
    </Reveal>
  );
}
