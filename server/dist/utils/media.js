const INSTAGRAM_RE = /instagram\.com\/(?:[\w.]+\/)?(p|reel|reels|tv)\/([\w-]+)/i;
export function parseInstagramUrl(url) {
    const match = url.match(INSTAGRAM_RE);
    if (!match)
        return null;
    const kind = match[1].toLowerCase().startsWith('reel') || match[1] === 'tv' ? 'reel' : 'p';
    return { kind, code: match[2] };
}
export function instagramEmbedUrl(url) {
    const parsed = parseInstagramUrl(url);
    if (!parsed)
        return '';
    return `https://www.instagram.com/${parsed.kind}/${parsed.code}/embed`;
}
export function youtubeEmbedUrl(url) {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/i);
    return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : '';
}
export function vimeoEmbedUrl(url) {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    return match ? `https://player.vimeo.com/video/${match[1]}` : '';
}
/** Fills derived fields (type, embedUrl) so the client can render any media kind consistently. */
export function normaliseMedia(input) {
    const data = { ...input };
    const url = String(data.url ?? '');
    const kind = String(data.kind ?? 'image');
    if (kind === 'instagram_post' || kind === 'instagram_reel') {
        data.source = 'instagram';
        if (!data.embedUrl)
            data.embedUrl = instagramEmbedUrl(url);
    }
    if (kind === 'external_video' && !data.embedUrl) {
        data.embedUrl = youtubeEmbedUrl(url) || vimeoEmbedUrl(url) || '';
    }
    if (data.type === undefined) {
        data.type = kind === 'image' || kind === 'instagram_post' ? 'image' : 'video';
    }
    return data;
}
export function slugify(value) {
    return value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}
