import { useEffect, useMemo, useRef, useState } from 'react';

interface Props {
  src?: string | null;
  alt: string;
  /** CSS aspect ratio such as "3/4". Omit when the parent controls the size. */
  ratio?: string;
  fallbacks?: (string | undefined | null)[];
  className?: string;
  imgClassName?: string;
  sizes?: string;
  eager?: boolean;
}

const WIDTHS = [480, 800, 1200, 1600, 2000];

/** Builds a srcset for CDNs that accept a width query parameter (Unsplash, Imgix, Cloudinary-style). */
function buildSrcSet(src: string) {
  try {
    const url = new URL(src);
    if (!url.searchParams.has('w')) return undefined;
    return WIDTHS.map((w) => {
      url.searchParams.set('w', String(w));
      return `${url.toString()} ${w}w`;
    }).join(', ');
  } catch {
    return undefined;
  }
}

export default function SmartImage({
  src,
  alt,
  ratio,
  fallbacks = [],
  className = '',
  imgClassName = '',
  sizes = '(min-width: 1024px) 50vw, 100vw',
  eager = false,
}: Props) {
  const candidates = useMemo(() => [src, ...fallbacks].filter((s): s is string => Boolean(s)), [src, fallbacks]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const prevSrc = useRef(src);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (prevSrc.current === src) return;
    prevSrc.current = src;
    setIndex(0);
    setLoaded(false);
  }, [src]);

  const current = candidates[index];
  const failed = !current;

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, [current]);

  return (
    <div
      className={`relative overflow-hidden bg-sand ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {!loaded && !failed && <div className="skeleton absolute inset-0" aria-hidden />}
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-sand" role="img" aria-label={alt}>
          <span className="font-serif text-lg italic tracking-wide text-taupe/70">LucianaSoul</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          key={current}
          src={current}
          srcSet={buildSrcSet(current)}
          sizes={sizes}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          {...(eager ? { fetchpriority: 'high' } : {})}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setIndex((i) => i + 1);
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      )}
    </div>
  );
}
