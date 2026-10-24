import { useRef, useState } from 'react';
import type { Media } from '../types';
import { API_BASE } from '../lib/api';
import { displayImageUrl, getDriveFileId, getDriveVideoPlayback } from '../lib/driveImage';
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
 * Uses Instagram's official /embed endpoint (no scraping or re-hosting).
 * Other videos show a play button, then play in place with controls.
 */
export default function InstagramMedia({ media, ratio = '4/5', className = '', interactive = false, sizes }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>('300px');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activated, setActivated] = useState(false);
  const [useEmbed, setUseEmbed] = useState(false);
  const isInstagram = media.kind === 'instagram_post' || media.kind === 'instagram_reel';
  const isVideo = media.type === 'video' || media.kind === 'instagram_reel' || media.kind === 'external_video';
  const alt = media.alt || media.title || 'LucianaSoul';
  const poster = media.thumbnailUrl || (media.kind === 'instagram_post' || media.kind === 'image' ? media.url : '');
  const driveId = isInstagram ? null : getDriveFileId(media.url);
  const driveFile = driveId ? `${API_BASE}/api/media/drive/${encodeURIComponent(driveId)}` : '';
  const driveEmbed = driveId ? getDriveVideoPlayback(media.url) : null;
  const embedSrc = media.embedUrl || driveEmbed || '';
  const fileSrc = driveFile || (!isInstagram && !embedSrc && media.kind === 'video' ? media.url : '');
  const canPlayHere = !isInstagram && Boolean(fileSrc || embedSrc);
  const revealed = interactive ? inView : activated;
  const showFile = Boolean(fileSrc) && !useEmbed && revealed;
  const showEmbed = Boolean(embedSrc) && (useEmbed || !fileSrc) && revealed;

  function startPlayback(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setActivated(true);
    if (fileSrc && !useEmbed) void videoRef.current?.play().catch(() => undefined);
  }

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

  const label = isInstagram ? 'View on Instagram' : 'Watch video';

  return (
    <div ref={ref} className={`group relative overflow-hidden bg-sand ${className}`} style={{ aspectRatio: isInstagram ? undefined : ratio }}>
      {fileSrc && !useEmbed && (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full bg-black object-contain ${showFile ? 'z-10' : 'pointer-events-none opacity-0'}`}
          src={fileSrc}
          poster={displayImageUrl(media.thumbnailUrl) || undefined}
          controls={showFile}
          playsInline
          preload="none"
          aria-label={alt}
          onError={() => setUseEmbed(true)}
        />
      )}
      {showEmbed && driveEmbed && embedSrc === driveEmbed ? (
        <div className="absolute inset-0 z-10 overflow-hidden bg-black">
          <iframe
            src={embedSrc}
            title={alt}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute left-0 w-full border-0"
            style={{ top: '-3.25rem', height: 'calc(100% + 3.25rem)' }}
          />
        </div>
      ) : (
        showEmbed && (
          <iframe
            src={embedSrc}
            title={alt}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className={isInstagram ? 'h-[620px] w-full border-0 bg-white' : 'absolute inset-0 z-10 h-full w-full border-0'}
          />
        )
      )}
      {!showFile && !showEmbed && (
        <>
          <SmartImage src={poster} alt={alt} ratio={ratio} sizes={sizes} className="zoom-hover" eager />
          <div className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/25" />
          {isVideo && canPlayHere && (
            <button
              type="button"
              aria-label="Play video"
              onClick={startPlayback}
              className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cream/80 bg-ink/50 text-cream backdrop-blur-[2px]"
            >
              <PlayIcon className="ml-0.5 h-4 w-4" />
            </button>
          )}
          {isVideo && !canPlayHere && (
            <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cream/80 text-cream backdrop-blur-[2px]">
              <PlayIcon className="ml-0.5 h-4 w-4" />
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 bg-gradient-to-t from-ink/55 to-transparent p-4 pt-16 text-cream">
            <span className="label min-w-0 truncate text-cream/90">{isInstagram ? '' : media.title || ''}</span>
            {canPlayHere ? (
              <button type="button" onClick={startPlayback} className="label shrink-0 text-cream underline-offset-4 hover:underline">
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
        </>
      )}
    </div>
  );
}
