import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useFetch } from '../../lib/useFetch';
import { AVAILABILITY_LABELS, PRODUCT_CATEGORY_LABELS } from '../../lib/labels';
import type { CollectionCategory, Paged, Product } from '../../types';
import { heroMedia } from '../../components/EditorialPiece';
import MediaThumb from '../MediaThumb';
import { PageHeader, Toggle, inputCls, smallBtn, useToast } from '../ui';

interface AdminSettings {
  collectionCategories: CollectionCategory[];
}

export default function Collections() {
  const toast = useToast();
  const settings = useFetch<AdminSettings>('/admin/settings');
  const products = useFetch<Paged<Product>>('/products?limit=100');
  const [categories, setCategories] = useState<CollectionCategory[]>([]);
  const [order, setOrder] = useState<Product[]>([]);

  useEffect(() => {
    if (settings.data) setCategories(settings.data.collectionCategories);
  }, [settings.data]);
  useEffect(() => {
    if (products.data) setOrder(products.data.items);
  }, [products.data]);

  async function saveCategories() {
    try {
      await api('/admin/settings', { method: 'PUT', body: { collectionCategories: categories } });
      toast('Filters saved');
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...order];
    const t = index + dir;
    if (t < 0 || t >= next.length) return;
    [next[index], next[t]] = [next[t], next[index]];
    setOrder(next);
    try {
      await api('/products/reorder', { method: 'PUT', body: { ids: next.map((p) => p._id) } });
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }

  async function toggleFeatured(p: Product) {
    setOrder((list) => list.map((x) => (x._id === p._id ? { ...x, featured: !p.featured } : x)));
    try {
      await api(`/products/${p._id}`, { method: 'PUT', body: { featured: !p.featured } });
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }

  return (
    <>
      <PageHeader title="Collections" subtitle="Control the collection filters, the order pieces appear in, and which pieces are featured on the homepage." />

      <section className="mb-12">
        <h2 className="label mb-4 text-taupe">Collection filters</h2>
        <div className="space-y-2">
          {categories.map((c, i) => (
            <div key={c.key} className="flex flex-wrap items-center gap-4 border border-taupe/30 p-3">
              <span className="w-28 text-xs uppercase tracking-widest text-taupe">{PRODUCT_CATEGORY_LABELS[c.key] ?? c.key}</span>
              <input
                className={`${inputCls} max-w-xs`}
                value={c.label}
                aria-label={`Label for ${c.key}`}
                onChange={(e) => setCategories(categories.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              />
              <Toggle
                label="Visible"
                checked={c.visible}
                onChange={(v) => setCategories(categories.map((x, j) => (j === i ? { ...x, visible: v } : x)))}
              />
            </div>
          ))}
        </div>
        <button type="button" className="btn-primary mt-4 px-5 py-3" onClick={saveCategories}>
          Save filters
        </button>
      </section>

      <section>
        <h2 className="label mb-4 text-taupe">Piece order</h2>
        <ul className="divide-y divide-taupe/30 border-y border-taupe/30">
          {order.map((p, i) => {
            const hero = heroMedia(p);
            return (
              <li key={p._id} className="flex items-center gap-4 py-2">
                <span className="w-6 text-right font-serif text-lg text-taupe">{i + 1}</span>
                <div className="w-12 shrink-0">{hero ? <MediaThumb media={hero} ratio="3/4" /> : <div className="aspect-[3/4] bg-sand" />}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-lg">{p.name}</p>
                  <p className="text-xs text-deep">
                    {PRODUCT_CATEGORY_LABELS[p.category]} · {AVAILABILITY_LABELS[p.availability]}
                  </p>
                </div>
                <button type="button" className={smallBtn} onClick={() => toggleFeatured(p)}>
                  {p.featured ? 'Featured ✓' : 'Feature'}
                </button>
                <button type="button" className={smallBtn} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                  ↑
                </button>
                <button type="button" className={smallBtn} disabled={i === order.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                  ↓
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
