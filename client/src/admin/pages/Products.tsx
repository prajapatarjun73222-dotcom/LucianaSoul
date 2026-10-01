import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useFetch } from '../../lib/useFetch';
import { AVAILABILITY_LABELS, PRODUCT_CATEGORY_LABELS } from '../../lib/labels';
import type { Paged, Product } from '../../types';
import { heroMedia } from '../../components/EditorialPiece';
import MediaThumb from '../MediaThumb';
import { PageHeader, dangerBtn, smallBtn, useToast } from '../ui';

export default function Products() {
  const toast = useToast();
  const { data, loading, reload } = useFetch<Paged<Product>>('/products?limit=100');

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}"? Its media stays in the library.`)) return;
    try {
      await api(`/products/${p._id}`, { method: 'DELETE' });
      toast('Piece deleted');
      reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Collection pieces. Prices are optional; bespoke and enquiry-only pieces work without one."
        actions={
          <Link to="/admin/products/new" className="btn-primary px-5 py-3">
            Add piece
          </Link>
        }
      />
      {loading && !data ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-20" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <p className="py-20 text-center text-deep">No pieces yet.</p>
      ) : (
        <ul className="divide-y divide-taupe/30 border-y border-taupe/30">
          {data.items.map((p) => {
            const hero = heroMedia(p);
            return (
              <li key={p._id} className="flex items-center gap-4 py-3">
                <div className="w-16 shrink-0">{hero ? <MediaThumb media={hero} ratio="3/4" /> : <div className="aspect-[3/4] bg-sand" />}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-xl">
                    {p.name} {p.featured && <span className="ml-2 align-middle bg-ink px-1.5 py-0.5 font-sans text-[9px] uppercase tracking-widest text-cream">Featured</span>}
                  </p>
                  <p className="text-xs text-deep">
                    {PRODUCT_CATEGORY_LABELS[p.category]} · {AVAILABILITY_LABELS[p.availability]} · {p.media.length} media
                    {p.priceDisplay ? ` · ${p.priceDisplay}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                  <a href={`/collection/${p.slug}`} target="_blank" rel="noreferrer" className={smallBtn}>
                    View
                  </a>
                  <Link to={`/admin/products/${p._id}`} className={smallBtn}>
                    Edit
                  </Link>
                  <button type="button" className={dangerBtn} onClick={() => remove(p)}>
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
