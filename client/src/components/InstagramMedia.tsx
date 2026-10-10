import { useState } from 'react';
import type { Media } from '../types';
import { useInView } from '../lib/useInView';
import SmartImage from './SmartImage';
import { InstagramIcon, PlayIcon } from './Icons';

interface Props {
  media: Media;
  ratio?: string;
  className?: string;
  /** When true, Instagram embeds and videos load in place once visible. Otherwise a poster links out. */
  interactive?: boolean;
  sizes?: string;
}

const isDirectVideo = (url: string) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);

/**
 * Renders Instagram posts, carousels and Reels plus external videos.
 * Uses Instagram's official /embed endpoint (no scraping or re-hosting); falls back to a
 * poster with "View on Instagram" when no embed is available.
 */
export default function InstagramMedia({ media, ratio = '4/5', className = '', interactive = false, sizes }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>('300px');
  const [activated, setActivated] = useState(false);
  const isInstagram = media.kind === 'instagram_post' || media.kind === 'instagram_reel';
  const isVideo = media.type === 'video' || media.kind === 'instagram_reel' || media.kind === 'external_video';
  const alt = media.alt || media.title || 'LucianaSoul';
  const poster = media.thumbnailUrl || (media.kind === 'instagram_post' || media.kind === 'image' ? media.url : '');

  if (!isInstagram && isDirectVideo(media.url)) {
    return (
      <div ref={ref} className={`relative overflow-hidden bg-sand ${className}`} style={{ aspectRatio: ratio }}>
        {inView ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={media.url}
            poster={media.thumbnailUrl || undefined}
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            aria-label={alt}
          />
        ) : (
          <div className="skeleton absolute inset-0" />
        )}
      </div>
    );
  }

  const canEmbed = Boolean(media.embedUrl);
  const showEmbed = canEmbed && (interactive ? inView : activated);

  if (showEmbed) {
    return (
      <div
        ref={ref}
        className={`relative overflow-hidden bg-sand ${className}`}
        style={{ aspectRatio: isInstagram ? undefined : ratio, minHeight: isInstagram ? 480 : undefined }}
      >
        <iframe
          src={media.embedUrl}
          title={alt}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className={isInstagram ? 'h-[620px] w-full border-0 bg-white' : 'absolute inset-0 h-full w-full border-0'}
        />
      </div>
    );
  }

  const label = isInstagram ? 'View on Instagram' : 'Watch video';

  return (
    <div ref={ref} className={`group relative overflow-hidden ${className}`}>
      <SmartImage src={poster} alt={alt} ratio={ratio} sizes={sizes} className="zoom-hover" />
      <div className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/25" />
      {isVideo && (
        <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cream/80 text-cream backdrop-blur-[2px]">
          <PlayIcon className="ml-0.5 h-4 w-4" />
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-ink/55 to-transparent p-4 pt-16 text-cream">
        <span className="label min-w-0 truncate text-cream/90">{isInstagram ? '' : media.title || ''}</span>
        {canEmbed && !isInstagram ? (
          <button type="button" onClick={() => setActivated(true)} className="label shrink-0 text-cream underline-offset-4 hover:underline">
            {label}
          </button>
        ) : (
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="label flex shrink-0 items-center gap-2 text-cream underline-offset-4 hover:underline"
          >
            {isInstagram && <InstagramIcon className="h-3.5 w-3.5" />}
            {label}
          </a>
        )}
      </div>
    </div>
  );
}
