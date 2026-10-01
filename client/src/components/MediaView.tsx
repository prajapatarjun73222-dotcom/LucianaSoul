import type { Media } from '../types';
import SmartImage from './SmartImage';
import InstagramMedia from './InstagramMedia';

interface Props {
  media?: Media | null;
  ratio?: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  eager?: boolean;
  interactive?: boolean;
  fallback?: Media | null;
}

/** Renders any media-library item: plain images through SmartImage, everything else through InstagramMedia. */
export default function MediaView({ media, ratio, className = '', imgClassName, sizes, eager, interactive, fallback }: Props) {
  if (!media) {
    return <SmartImage src={null} alt="LucianaSoul" ratio={ratio} className={className} />;
  }
  if (media.kind === 'image') {
    return (
      <SmartImage
        src={media.url}
        fallbacks={[media.thumbnailUrl, fallback?.thumbnailUrl || (fallback?.kind === 'image' ? fallback.url : undefined)]}
        alt={media.alt || media.title || 'LucianaSoul'}
        ratio={ratio}
        className={className}
        imgClassName={imgClassName}
        sizes={sizes}
        eager={eager}
      />
    );
  }
  return <InstagramMedia media={media} ratio={ratio} className={className} interactive={interactive} sizes={sizes} />;
}

export function posterOf(media?: Media | null) {
  if (!media) return '';
  return media.thumbnailUrl || (media.kind === 'image' || media.kind === 'instagram_post' ? media.url : '');
}
