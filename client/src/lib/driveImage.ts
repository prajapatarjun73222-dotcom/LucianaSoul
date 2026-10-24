const DRIVE_HOST = 'drive.google.com';
const FILE_ID_RE = /^[a-zA-Z0-9_-]{10,}$/;
const DEFAULT_SIZE = 'w1200';

/**
 * Turns a Google Drive link into a thumbnail image URL.
 * Returns null for empty, invalid, or unsupported input. Non-Drive URLs are also null;
 * use displayImageUrl when an existing image address should pass through unchanged.
 */
export function getDriveFileId(input: string | null | undefined): string | null {
  const url = parseDriveUrl(input);
  if (!url) return null;
  const fileId = extractFileId(url);
  if (!fileId || !FILE_ID_RE.test(fileId)) return null;
  return fileId;
}

export function getDriveImageUrl(input: string | null | undefined): string | null {
  const url = parseDriveUrl(input);
  if (!url) return null;

  const fileId = getDriveFileId(input);
  if (!fileId) return null;

  const size = url.pathname === '/thumbnail' ? url.searchParams.get('sz')?.trim() || DEFAULT_SIZE : DEFAULT_SIZE;
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=${encodeURIComponent(size)}`;
}

/** Keeps ordinary image addresses and converts Drive links. Invalid Drive links become null. */
export function displayImageUrl(input: string | null | undefined): string | null {
  if (!input?.trim()) return null;
  const trimmed = input.trim();
  if (!parseDriveUrl(trimmed)) return trimmed;
  return getDriveImageUrl(trimmed);
}

/** Google's own player, used only if the normal video player cannot load the file. */
export function getDriveVideoPlayback(input: string | null | undefined): string | null {
  const fileId = getDriveFileId(input);
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`;
}

function parseDriveUrl(input: string | null | undefined): URL | null {
  if (!input?.trim()) return null;
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (url.hostname !== DRIVE_HOST) return null;
  return url;
}

function extractFileId(url: URL): string | null {
  const fromPath = url.pathname.match(/^\/file\/d\/([^/]+)/);
  if (fromPath) {
    try {
      return decodeURIComponent(fromPath[1]);
    } catch {
      return null;
    }
  }

  if (url.pathname === '/thumbnail' || url.pathname === '/open' || url.pathname === '/uc') {
    return url.searchParams.get('id');
  }

  return null;
}
