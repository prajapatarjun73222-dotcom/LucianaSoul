import SmartImage from '../components/SmartImage';
import { InstagramIcon, PlayIcon } from '../components/Icons';
import { posterOf } from '../components/MediaView';
import { KIND_LABELS } from '../lib/labels';
import type { Media } from '../types';

/** Admin-side preview: never loads embeds, just the poster with a type badge. */
export default function MediaThumb({ media, ratio = '1/1' }: { media: Media; ratio?: string }) {
  const isVideo = media.type === 'video';
  const isDirectVideo = /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(media.url);
  const poster = posterOf(media);
  return (
    <div className="relative">
      {isDirectVideo && !poster ? (
        <div className="relative bg-sand" style={{ aspectRatio: ratio }}>
          <video src={media.url} muted preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      ) : (
        <SmartImage src={poster} alt={media.alt || media.title || ''} ratio={ratio} sizes="300px" />
      )}
      {isVideo && (
        <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink/50 text-cream">
          <PlayIcon className="ml-0.5 h-3.5 w-3.5" />
        </span>
      )}
      <span className="absolute left-2 top-2 flex items-center gap-1 bg-cream/90 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-ink">
        {media.source === 'instagram' && <InstagramIcon className="h-3 w-3" />}
        {KIND_LABELS[media.kind]}
      </span>
      {media.featured && (
        <span className="absolute right-2 top-2 bg-ink px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-cream">Featured</span>
      )}
    </div>
  );
}
