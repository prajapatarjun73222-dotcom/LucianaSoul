import { Link } from 'react-router-dom';
import { useFetch } from '../../lib/useFetch';
import { formatDate } from '../../lib/labels';
import type { BlogPost, Enquiry, Media, Paged, Product } from '../../types';
import { PageHeader } from '../ui';
import { useAuth } from '../auth';

export default function Dashboard() {
  const { user } = useAuth();
  const media = useFetch<Paged<Media>>('/media?limit=1');
  const products = useFetch<Paged<Product>>('/products?limit=1');
  const posts = useFetch<Paged<BlogPost>>('/blog?all=true&limit=1');
  const enquiries = useFetch<Paged<Enquiry> & { unread: number }>('/admin/enquiries?limit=5');

  const stats = [
    { label: 'Media items', value: media.data?.total, to: '/admin/media' },
    { label: 'Pieces', value: products.data?.total, to: '/admin/products' },
    { label: 'Journal posts', value: posts.data?.total, to: '/admin/blog' },
    { label: 'New enquiries', value: enquiries.data?.unread, to: '/admin/enquiries' },
  ];

  return (
    <>
      <PageHeader title={`Welcome${user?.name ? `, ${user.name}` : ''}`} subtitle="Manage the LucianaSoul website: media, pieces, journal and enquiries." />
      <div className="grid grid-cols-2 gap-px bg-taupe/30 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="bg-cream p-6 transition-colors hover:bg-sand">
            <p className="font-serif text-5xl font-light">{s.value ?? '–'}</p>
            <p className="label mt-2 text-taupe">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="label mb-4 text-taupe">Latest enquiries</h2>
          {enquiries.data?.items.length ? (
            <ul className="divide-y divide-taupe/30 border-y border-taupe/30">
              {enquiries.data.items.map((e) => (
                <li key={e._id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {e.name} {e.status === 'new' && <span className="ml-2 bg-ink px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-cream">New</span>}
                    </p>
                    <p className="truncate text-deep">{e.productName || e.message || e.designIdea}</p>
                  </div>
                  <span className="shrink-0 text-xs text-taupe">{formatDate(e.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-deep">No enquiries yet.</p>
          )}
        </section>
        <section>
          <h2 className="label mb-4 text-taupe">Quick start</h2>
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-deep">
            <li>
              Add LucianaSoul's photos, Instagram posts and Reels in <Link to="/admin/media" className="underline">Media</Link>.
            </li>
            <li>
              Create pieces and attach media to them in <Link to="/admin/products" className="underline">Products</Link>.
            </li>
            <li>
              Choose which media appears on the homepage in <Link to="/admin/settings" className="underline">Settings</Link>.
            </li>
            <li>Write the designer story on the About tab in Settings.</li>
            <li>Configure SMTP in Settings to receive enquiry emails (optional; enquiries are always saved here).</li>
          </ol>
        </section>
      </div>
    </>
  );
}
