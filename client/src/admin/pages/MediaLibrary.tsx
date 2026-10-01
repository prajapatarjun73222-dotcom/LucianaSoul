import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../../lib/api';
import { useFetch } from '../../lib/useFetch';
import { KIND_LABELS, SOURCE_LABELS } from '../../lib/labels';
import type { Media, MediaKind, MediaSource, Paged } from '../../types';
import TextTabs from '../../components/TextTabs';
import MediaThumb from '../MediaThumb';
import { Field, Modal, PageHeader, Toggle, dangerBtn, inputCls, smallBtn, useToast } from '../ui';

const FILTERS = [
  { key: 'all', label: 'All', query: '' },
  { key: 'instagram', label: 'Instagram', query: 'source=instagram' },
  { key: 'google_maps', label: 'Google Maps', query: 'source=google_maps' },
  { key: 'client', label: 'Client', query: 'source=client' },
  { key: 'products', label: 'Products', query: 'usage=products' },
  { key: 'homepage', label: 'Homepage', query: 'usage=homepage' },
  { key: 'blog', label: 'Blog', query: 'usage=blog' },
];

const CATEGORIES = ['collection', 'product', 'homepage', 'instagram', 'blog', 'bespoke', 'sustainability', 'studio', 'fabric', 'other'];

const KIND_CHOICES: { kind: MediaKind; label: string; hint: string }[] = [
  { kind: 'image', label: 'Image', hint: 'Direct image URL (jpg, png, webp)' },
  { kind: 'video', label: 'Video', hint: 'Direct video file URL (mp4, webm)' },
  { kind: 'instagram_post', label: 'Instagram post', hint: 'https://www.instagram.com/p/...' },
  { kind: 'instagram_reel', label: 'Instagram Reel', hint: 'https://www.instagram.com/reel/...' },
  { kind: 'external_video', label: 'External video', hint: 'YouTube, Vimeo or other video page URL' },
];

type Draft = {
  _id?: string;
  kind: MediaKind;
  source: MediaSource;
  url: string;
  thumbnailUrl: string;
  title: string;
  caption: string;
  alt: string;
  category: string;
  featured: boolean;
  sortOrder: number;
};

function detectKind(url: string): MediaKind {
  if (/instagram\.com\/(?:[\w.]+\/)?(reel|reels|tv)\//i.test(url)) return 'instagram_reel';
  if (/instagram\.com\/(?:[\w.]+\/)?p\//i.test(url)) return 'instagram_post';
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url)) return 'video';
  if (/youtube\.com|youtu\.be|vimeo\.com/i.test(url)) return 'external_video';
  return 'image';
}

const emptyDraft = (): Draft => ({
  kind: 'image',
  source: 'client',
  url: '',
  thumbnailUrl: '',
  title: '',
  caption: '',
  alt: '',
  category: 'collection',
  featured: false,
  sortOrder: 0,
});

export default function MediaLibrary() {
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const query = FILTERS.find((f) => f.key === filter)?.query ?? '';
  const { data, loading, reload } = useFetch<Paged<Media>>(`/media?limit=200&${query}`);
  const [items, setItems] = useState<Media[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulk, setBulk] = useState({ urls: '', source: 'google_maps' as MediaSource, category: 'collection', title: '' });

  useEffect(() => setItems(data?.items ?? []), [data]);

  const bulkUrls = bulk.urls
    .split(/\s+/)
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//i.test(u));

  async function saveBulk(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    let added = 0;
    const failed: string[] = [];
    for (const [i, url] of bulkUrls.entries()) {
      const kind = detectKind(url);
      try {
        await api('/media', {
          method: 'POST',
          body: {
            kind,
            source: kind.startsWith('instagram') ? 'instagram' : bulk.source,
            url,
            title: bulk.title ? `${bulk.title}${bulkUrls.length > 1 ? ` ${i + 1}` : ''}` : '',
            alt: bulk.title,
            category: bulk.category,
            sortOrder: items.length + i,
          },
        });
        added++;
      } catch {
        failed.push(url);
      }
    }
    setSaving(false);
    toast(`${added} item${added === 1 ? '' : 's'} added${failed.length ? `, ${failed.length} failed` : ''}`, failed.length ? 'error' : 'ok');
    setBulk((b) => ({ ...b, urls: failed.join('\n') }));
    if (!failed.length) setBulkOpen(false);
    reload();
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    const { _id, ...body } = draft;
    const payload = {
      ...body,
      source: draft.kind.startsWith('instagram') ? 'instagram' : draft.source,
      thumbnailUrl: draft.thumbnailUrl.trim(),
      url: draft.url.trim(),
    };
    try {
      if (_id) await api(`/media/${_id}`, { method: 'PUT', body: payload });
      else await api('/media', { method: 'POST', body: { ...payload, sortOrder: payload.sortOrder || items.length } });
      toast(_id ? 'Media updated' : 'Media added');
      setDraft(null);
      reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove(m: Media) {
    if (!confirm(`Delete "${m.title || 'this media'}"? It will also be removed from any pieces, posts and homepage sections.`)) return;
    try {
      await api(`/media/${m._id}`, { method: 'DELETE' });
      toast('Media deleted');
      reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }

  async function toggleFeatured(m: Media) {
    setItems((list) => list.map((x) => (x._id === m._id ? { ...x, featured: !m.featured } : x)));
    try {
      await api(`/media/${m._id}`, { method: 'PUT', body: { featured: !m.featured } });
    } catch (err) {
      toast((err as Error).message, 'error');
      reload();
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    try {
      await api('/media/reorder', { method: 'PUT', body: { ids: next.map((m) => m._id) } });
    } catch (err) {
      toast((err as Error).message, 'error');
      reload();
    }
  }

  const kindInfo = KIND_CHOICES.find((k) => k.kind === draft?.kind);
  const needsThumb = draft && draft.kind !== 'image';
  const previewMedia: Media | null = draft
    ? {
        _id: 'preview',
        type: draft.kind === 'image' || draft.kind === 'instagram_post' ? 'image' : 'video',
        kind: draft.kind,
        source: draft.source,
        url: draft.url,
        thumbnailUrl: draft.thumbnailUrl,
        title: draft.title,
        alt: draft.alt,
        featured: draft.featured,
      }
    : null;

  return (
    <>
      <PageHeader
        title="Media"
        subtitle="Every image and video on the website comes from here. Media is stored as links, so only add content LucianaSoul has the right to display."
        actions={
          <>
            <button type="button" className="btn-outline px-5 py-3" onClick={() => setBulkOpen(true)}>
              Bulk add links
            </button>
            <button type="button" className="btn-primary px-5 py-3" onClick={() => setDraft(emptyDraft())}>
              Add media
            </button>
          </>
        }
      />
      <TextTabs tabs={FILTERS} active={filter} onChange={setFilter} className="mb-8" />

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton aspect-square" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-20 text-center text-deep">No media here yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-5">
          {items.map((m, i) => (
            <article key={m._id} className="border border-taupe/30 bg-cream">
              <MediaThumb media={m} />
              <div className="space-y-1 p-3 text-xs">
                <p className="truncate font-medium text-ink" title={m.title}>
                  {m.title || <span className="text-taupe">Untitled</span>}
                </p>
                <p className="text-deep">
                  <span className="text-taupe">Source:</span> {SOURCE_LABELS[m.source]}
                </p>
                <p className="text-deep">
                  <span className="text-taupe">Category:</span> {m.category}
                </p>
                {m.source === 'instagram' && (
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="block text-deep underline">
                    View on Instagram
                  </a>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 border-t border-taupe/30 p-3">
                <button
                  type="button"
                  className={smallBtn}
                  onClick={() =>
                    setDraft({
                      _id: m._id,
                      kind: m.kind,
                      source: m.source,
                      url: m.url,
                      thumbnailUrl: m.thumbnailUrl ?? '',
                      title: m.title ?? '',
                      caption: m.caption ?? '',
                      alt: m.alt ?? '',
                      category: m.category ?? 'other',
                      featured: Boolean(m.featured),
                      sortOrder: m.sortOrder ?? 0,
                    })
                  }
                >
                  Edit
                </button>
                <button type="button" className={smallBtn} onClick={() => toggleFeatured(m)}>
                  {m.featured ? 'Unfeature' : 'Feature'}
                </button>
                <button type="button" className={dangerBtn} onClick={() => remove(m)}>
                  Delete
                </button>
                {filter === 'all' && (
                  <span className="ml-auto flex gap-1">
                    <button type="button" className={smallBtn} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move earlier">
                      ↑
                    </button>
                    <button type="button" className={smallBtn} disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move later">
                      ↓
                    </button>
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)} title="Bulk add links" wide>
        <form onSubmit={saveBulk} className="space-y-5">
          <div className="space-y-2 bg-sand p-4 text-xs leading-relaxed text-deep">
            <p>
              <strong>Google Maps photos:</strong> open the LucianaSoul listing, click Photos, open a photo, then right-click it and choose
              "Copy image address". The link starts with https://lh3.googleusercontent.com/...
            </p>
            <p>
              <strong>Instagram:</strong> on a post or Reel, use Share, then Copy link. Posts and Reels are shown with Instagram's official
              embed; add a poster image afterwards with Edit for the nicest grid.
            </p>
            <p>Only add photos LucianaSoul owns or has permission to use.</p>
          </div>
          <Field label={`Links, one per line (${bulkUrls.length} detected)`}>
            <textarea
              rows={8}
              className={`${inputCls} font-mono text-xs`}
              value={bulk.urls}
              onChange={(e) => setBulk({ ...bulk, urls: e.target.value })}
              placeholder={'https://lh3.googleusercontent.com/...\nhttps://www.instagram.com/p/...\nhttps://www.instagram.com/reel/...'}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Source for non-Instagram links">
              <select className={inputCls} value={bulk.source} onChange={(e) => setBulk({ ...bulk, source: e.target.value as MediaSource })}>
                {Object.entries(SOURCE_LABELS)
                  .filter(([k]) => k !== 'instagram')
                  .map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Category">
              <select className={inputCls} value={bulk.category} onChange={(e) => setBulk({ ...bulk, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Title / alt text (optional)" hint="Numbered automatically.">
              <input className={inputCls} value={bulk.title} onChange={(e) => setBulk({ ...bulk, title: e.target.value })} />
            </Field>
          </div>
          {bulkUrls.length > 0 && (
            <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-deep">
              {bulkUrls.map((u) => (
                <li key={u} className="truncate">
                  <span className="mr-2 inline-block w-28 uppercase tracking-widest text-taupe">{KIND_LABELS[detectKind(u)]}</span>
                  {u}
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-end gap-3 border-t border-taupe/30 pt-5">
            <button type="button" className={smallBtn} onClick={() => setBulkOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={saving || bulkUrls.length === 0} className="btn-primary px-6 py-3">
              {saving ? 'Adding...' : `Add ${bulkUrls.length} item${bulkUrls.length === 1 ? '' : 's'}`}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(draft)} onClose={() => setDraft(null)} title={draft?._id ? 'Edit media' : 'Add media'} wide>
        {draft && (
          <form onSubmit={save} className="grid gap-8 md:grid-cols-[1fr_260px]">
            <div className="space-y-5">
              <div>
                <span className="field-label">Type</span>
                <div className="flex flex-wrap gap-2">
                  {KIND_CHOICES.map((k) => (
                    <button
                      key={k.kind}
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          kind: k.kind,
                          source: k.kind.startsWith('instagram') ? 'instagram' : draft.source === 'instagram' ? 'client' : draft.source,
                        })
                      }
                      className={`border px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] ${
                        draft.kind === k.kind ? 'border-ink bg-ink text-cream' : 'border-taupe/60 text-ink hover:border-ink'
                      }`}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="URL *" hint={kindInfo?.hint}>
                <input required type="url" className={inputCls} value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
              </Field>
              {needsThumb && (
                <Field
                  label="Thumbnail / poster image URL"
                  hint="Shown before the video or embed loads, and wherever direct playback is not possible."
                >
                  <input type="url" className={inputCls} value={draft.thumbnailUrl} onChange={(e) => setDraft({ ...draft, thumbnailUrl: e.target.value })} />
                </Field>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Title">
                  <input className={inputCls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                </Field>
                <Field label="Alt text" hint="Describe the image for screen readers and search engines.">
                  <input className={inputCls} value={draft.alt} onChange={(e) => setDraft({ ...draft, alt: e.target.value })} />
                </Field>
              </div>
              <Field label="Caption">
                <textarea rows={2} className={inputCls} value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Source">
                  <select
                    className={inputCls}
                    value={draft.kind.startsWith('instagram') ? 'instagram' : draft.source}
                    disabled={draft.kind.startsWith('instagram')}
                    onChange={(e) => setDraft({ ...draft, source: e.target.value as MediaSource })}
                  >
                    {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Category">
                  <select className={inputCls} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Display order">
                  <input
                    type="number"
                    className={inputCls}
                    value={draft.sortOrder}
                    onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <Toggle checked={draft.featured} onChange={(v) => setDraft({ ...draft, featured: v })} label="Featured" />
              {draft.source === 'google_maps' && (
                <p className="bg-sand p-3 text-xs leading-relaxed text-deep">
                  Only use Google Maps photos that LucianaSoul owns or has permission to reuse (for example, photos uploaded by the business).
                </p>
              )}
              <div className="flex justify-end gap-3 border-t border-taupe/30 pt-5">
                <button type="button" className={smallBtn} onClick={() => setDraft(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary px-6 py-3">
                  {saving ? 'Saving...' : 'Save media'}
                </button>
              </div>
            </div>
            <div>
              <span className="field-label">Preview</span>
              {previewMedia && previewMedia.url ? (
                <MediaThumb media={previewMedia} ratio="4/5" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-sand text-xs text-taupe">Enter a URL to preview</div>
              )}
              <p className="mt-2 text-xs text-taupe">{KIND_LABELS[draft.kind]}</p>
              {draft.kind.startsWith('instagram') && (
                <p className="mt-2 text-xs leading-relaxed text-deep">
                  Instagram content is shown with Instagram's official embed or as a poster linking to the original post. Nothing is downloaded or re-hosted.
                </p>
              )}
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
