import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { AVAILABILITY_LABELS, PRODUCT_CATEGORY_LABELS } from '../../lib/labels';
import type { Availability, Media, Product } from '../../types';
import MediaPicker from '../MediaPicker';
import MediaThumb from '../MediaThumb';
import { Field, PageHeader, Toggle, inputCls, smallBtn, useToast } from '../ui';

const ROLES = ['hero', 'front', 'back', 'detail', 'fabric', 'reel', 'studio', 'editorial', 'other'];

type Draft = {
  name: string;
  slug: string;
  description: string;
  story: string;
  category: string;
  categories: string[];
  materials: string;
  dimensions: string;
  designDetails: string;
  availability: Availability;
  price: string;
  priceDisplay: string;
  featured: boolean;
  tags: string;
  media: { media: Media; role: string }[];
};

const empty: Draft = {
  name: '',
  slug: '',
  description: '',
  story: '',
  category: 'upcycled',
  categories: [],
  materials: '',
  dimensions: '',
  designDetails: '',
  availability: 'ENQUIRE',
  price: '',
  priceDisplay: '',
  featured: false,
  tags: '',
  media: [],
};

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft>(empty);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState(false);

  useEffect(() => {
    if (!id) return;
    api<Product>(`/products/id/${id}`)
      .then((p) =>
        setDraft({
          name: p.name,
          slug: p.slug,
          description: p.description ?? '',
          story: p.story ?? '',
          category: p.category,
          categories: p.categories ?? [],
          materials: p.materials ?? '',
          dimensions: p.dimensions ?? '',
          designDetails: p.designDetails ?? '',
          availability: p.availability,
          price: p.price != null ? String(p.price) : '',
          priceDisplay: p.priceDisplay ?? '',
          featured: Boolean(p.featured),
          tags: (p.tags ?? []).join(', '),
          media: p.media.filter((m) => m.mediaId).map((m) => ({ media: m.mediaId as Media, role: m.role })),
        }),
      )
      .catch((err) => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [id, toast]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: draft.name.trim(),
      slug: draft.slug.trim() || undefined,
      description: draft.description,
      story: draft.story,
      category: draft.category,
      categories: Array.from(new Set([draft.category, ...draft.categories])),
      materials: draft.materials,
      dimensions: draft.dimensions,
      designDetails: draft.designDetails,
      availability: draft.availability,
      price: draft.price.trim() ? Number(draft.price) : null,
      priceDisplay: draft.priceDisplay,
      featured: draft.featured,
      tags: draft.tags.split(',').map((t) => t.trim()).filter(Boolean),
      media: draft.media.map((m) => ({ mediaId: m.media._id, role: m.role })),
    };
    try {
      if (id) await api(`/products/${id}`, { method: 'PUT', body });
      else await api('/products', { method: 'POST', body });
      toast('Piece saved');
      navigate('/admin/products');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  }

  function moveMedia(index: number, dir: -1 | 1) {
    const next = [...draft.media];
    const t = index + dir;
    if (t < 0 || t >= next.length) return;
    [next[index], next[t]] = [next[t], next[index]];
    set('media', next);
  }

  if (loading) return <div className="skeleton h-96" />;

  return (
    <form onSubmit={save}>
      <PageHeader
        title={id ? 'Edit piece' : 'New piece'}
        actions={
          <>
            <Link to="/admin/products" className={smallBtn}>
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn-primary px-6 py-3">
              {saving ? 'Saving...' : 'Save piece'}
            </button>
          </>
        }
      />
      <div className="grid gap-10 xl:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name *">
              <input required className={inputCls} value={draft.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="URL slug" hint="Leave empty to generate from the name.">
              <input className={inputCls} value={draft.slug} onChange={(e) => set('slug', e.target.value)} />
            </Field>
          </div>
          <Field label="Short description">
            <textarea rows={3} className={inputCls} value={draft.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
          <Field label="Product story">
            <textarea rows={5} className={inputCls} value={draft.story} onChange={(e) => set('story', e.target.value)} />
          </Field>
          <Field label="Design details">
            <textarea rows={3} className={inputCls} value={draft.designDetails} onChange={(e) => set('designDetails', e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Materials">
              <input className={inputCls} value={draft.materials} onChange={(e) => set('materials', e.target.value)} />
            </Field>
            <Field label="Size / dimensions">
              <input className={inputCls} value={draft.dimensions} onChange={(e) => set('dimensions', e.target.value)} />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Main category">
              <select className={inputCls} value={draft.category} onChange={(e) => set('category', e.target.value)}>
                {Object.entries(PRODUCT_CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Availability">
              <select className={inputCls} value={draft.availability} onChange={(e) => set('availability', e.target.value as Availability)}>
                {Object.entries(AVAILABILITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tags" hint="Comma separated">
              <input className={inputCls} value={draft.tags} onChange={(e) => set('tags', e.target.value)} />
            </Field>
          </div>
          <div>
            <span className="field-label">Also show under</span>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {Object.entries(PRODUCT_CATEGORY_LABELS)
                .filter(([k]) => k !== draft.category)
                .map(([k, v]) => (
                  <Toggle
                    key={k}
                    label={v}
                    checked={draft.categories.includes(k)}
                    onChange={(on) => set('categories', on ? [...draft.categories, k] : draft.categories.filter((c) => c !== k))}
                  />
                ))}
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price (GBP, optional)" hint="Used for structured data only. Leave empty for enquiry-only pieces.">
              <input type="number" min="0" step="0.01" className={inputCls} value={draft.price} onChange={(e) => set('price', e.target.value)} />
            </Field>
            <Field label="Price display (optional)" hint='Shown on the site, e.g. "From £450" or "Price on request".'>
              <input className={inputCls} value={draft.priceDisplay} onChange={(e) => set('priceDisplay', e.target.value)} />
            </Field>
          </div>
          <Toggle checked={draft.featured} onChange={(v) => set('featured', v)} label="Feature on the homepage" />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="field-label mb-0">Media gallery</span>
            <button type="button" className={smallBtn} onClick={() => setPicker(true)}>
              Choose from library
            </button>
          </div>
          <p className="mb-4 text-xs text-taupe">The first item, or the one with the "hero" role, is the main image.</p>
          {draft.media.length === 0 ? (
            <div className="flex aspect-[4/3] items-center justify-center border border-dashed border-taupe/60 text-sm text-taupe">No media attached</div>
          ) : (
            <ul className="space-y-3">
              {draft.media.map((m, i) => (
                <li key={m.media._id} className="flex items-center gap-3 border border-taupe/30 p-2">
                  <div className="w-16 shrink-0">
                    <MediaThumb media={m.media} ratio="3/4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="truncate text-xs">{m.media.title || m.media.url}</p>
                    <select
                      className={`${inputCls} py-1.5`}
                      value={m.role}
                      onChange={(e) => set('media', draft.media.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button type="button" className={smallBtn} onClick={() => moveMedia(i, -1)} disabled={i === 0} aria-label="Move up">
                      ↑
                    </button>
                    <button type="button" className={smallBtn} onClick={() => moveMedia(i, 1)} disabled={i === draft.media.length - 1} aria-label="Move down">
                      ↓
                    </button>
                    <button type="button" className={smallBtn} onClick={() => set('media', draft.media.filter((_, j) => j !== i))} aria-label="Remove">
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <MediaPicker
        open={picker}
        onClose={() => setPicker(false)}
        initial={draft.media.map((m) => m.media._id)}
        title="Attach media to this piece"
        onSelect={(items) => {
          const roles = new Map(draft.media.map((m) => [m.media._id, m.role]));
          set(
            'media',
            items.map((media, i) => ({
              media,
              role: roles.get(media._id) ?? (i === 0 ? 'hero' : media.kind === 'instagram_reel' ? 'reel' : 'detail'),
            })),
          );
        }}
      />
    </form>
  );
}
