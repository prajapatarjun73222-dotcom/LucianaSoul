import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useFetch } from '../../lib/useFetch';
import { BLOG_CATEGORY_LABELS, formatDate } from '../../lib/labels';
import type { BlogPost, Paged } from '../../types';
import MediaThumb from '../MediaThumb';
import { PageHeader, dangerBtn, smallBtn, useToast } from '../ui';

export default function Blog() {
  const toast = useToast();
  const { data, loading, reload } = useFetch<Paged<BlogPost>>('/blog?all=true&limit=50');

  async function togglePublished(p: BlogPost) {
    try {
      await api(`/blog/${p._id}`, { method: 'PUT', body: { published: !p.published } });
      toast(p.published ? 'Post unpublished' : 'Post published');
      reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }

  async function remove(p: BlogPost) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    await api(`/blog/${p._id}`, { method: 'DELETE' });
    toast('Post deleted');
    reload();
  }

  return (
    <>
      <PageHeader
        title="Journal"
        subtitle="Stories for the journal. Drafts are only visible here until published."
        actions={
          <Link to="/admin/blog/new" className="btn-primary px-5 py-3">
            New post
          </Link>
        }
      />
      {loading && !data ? (
        <div className="skeleton h-40" />
      ) : !data?.items.length ? (
        <p className="py-20 text-center text-deep">No posts yet.</p>
      ) : (
        <ul className="divide-y divide-taupe/30 border-y border-taupe/30">
          {data.items.map((p) => (
            <li key={p._id} className="flex items-center gap-4 py-3">
              <div className="w-20 shrink-0">{p.coverMedia ? <MediaThumb media={p.coverMedia} ratio="4/3" /> : <div className="aspect-[4/3] bg-sand" />}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-xl">{p.title}</p>
                <p className="text-xs text-deep">
                  {BLOG_CATEGORY_LABELS[p.category]} · {p.published ? `Published ${formatDate(p.publishedAt)}` : 'Draft'}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                <button type="button" className={smallBtn} onClick={() => togglePublished(p)}>
                  {p.published ? 'Unpublish' : 'Publish'}
                </button>
                <Link to={`/admin/blog/${p._id}`} className={smallBtn}>
                  Edit
                </Link>
                <button type="button" className={dangerBtn} onClick={() => remove(p)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
