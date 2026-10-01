import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import SectionHeading from '../components/SectionHeading';
import TextTabs from '../components/TextTabs';
import EditorialPiece from '../components/EditorialPiece';
import { api } from '../lib/api';
import { useSettings } from '../lib/settings';
import { PRODUCT_CATEGORY_LABELS } from '../lib/labels';
import type { Paged, Product } from '../types';

const PAGE_SIZE = 12;

/** Repeating 12-column rhythm: large portrait, offset tall, small detail, full-width, pair. */
const RHYTHM = [
  { cls: 'md:col-span-7', ratio: '4/5' },
  { cls: 'md:col-span-5 md:mt-48', ratio: '3/4' },
  { cls: 'md:col-span-4 md:col-start-2', ratio: '1/1' },
  { cls: 'md:col-span-6 md:col-start-7 md:-mt-12', ratio: '4/5' },
  { cls: 'md:col-span-12', ratio: '16/9' },
  { cls: 'md:col-span-5', ratio: '3/4' },
  { cls: 'md:col-span-4 md:mt-32', ratio: '2/3' },
  { cls: 'md:col-span-3 md:mt-64', ratio: '3/4' },
];

export default function Collection() {
  const { settings } = useSettings();
  const [params, setParams] = useSearchParams();
  const active = params.get('category') ?? 'all';
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const categories = (settings?.collectionCategories ?? Object.entries(PRODUCT_CATEGORY_LABELS).map(([key, label]) => ({ key, label, visible: true })))
    .filter((c) => c.visible);
  const tabs = [{ key: 'all', label: 'All' }, ...categories.map((c) => ({ key: c.key, label: c.label }))];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api<Paged<Product>>(`/products?category=${active}&page=${page}&limit=${PAGE_SIZE}`)
      .then((res) => {
        if (cancelled) return;
        setItems((prev) => (page === 1 ? res.items : [...prev, ...res.items]));
        setPages(res.pages);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [active, page]);

  function selectCategory(key: string) {
    setPage(1);
    setItems([]);
    setParams(key === 'all' ? {} : { category: key }, { replace: true });
  }

  return (
    <>
      <Seo
        title="The Collection"
        description="Explore LucianaSoul's collection of unique, up-cycled and bespoke pieces, designed in London."
      />
      <section className="container-editorial pb-10 pt-12 lg:pt-20">
        <SectionHeading as="h1" label="LucianaSoul" title="The Collection" subtitle="Pieces with a story." />
        <TextTabs tabs={tabs} active={active} onChange={selectCategory} className="mt-12 border-b border-taupe/30 pb-5" />
      </section>

      <section className="container-editorial">
        {items.length === 0 && loading ? (
          <div className="grid gap-8 md:grid-cols-12">
            {RHYTHM.slice(0, 4).map((r, i) => (
              <div key={i} className={r.cls}>
                <div className="skeleton" style={{ aspectRatio: r.ratio }} />
                <div className="skeleton mt-4 h-6 w-1/2" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-24 text-center font-serif text-2xl italic text-deep">New pieces are coming soon.</p>
        ) : (
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-12 md:gap-y-24">
            {items.map((p, i) => {
              const r = RHYTHM[i % RHYTHM.length];
              return (
                <EditorialPiece
                  key={p._id}
                  product={p}
                  ratio={r.ratio}
                  className={r.cls}
                  sizes={r.cls.includes('col-span-12') ? '100vw' : '(min-width: 768px) 50vw, 100vw'}
                />
              );
            })}
          </div>
        )}

        {page < pages && (
          <div className="mt-20 text-center">
            <button type="button" className="btn-outline" disabled={loading} onClick={() => setPage((p) => p + 1)}>
              {loading ? 'Loading...' : 'View more pieces'}
            </button>
          </div>
        )}
      </section>
    </>
  );
}
