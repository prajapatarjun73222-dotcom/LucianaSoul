import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { api } from '../../lib/api';
import { BLOG_CATEGORY_LABELS } from '../../lib/labels';
import type { BlogPost, Media } from '../../types';
import MediaPicker from '../MediaPicker';
import MediaThumb from '../MediaThumb';
import { Field, PageHeader, Toggle, inputCls, smallBtn, useToast } from '../ui';

type Draft = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  published: boolean;
  coverMedia: Media | null;
};

const empty: Draft = { title: '', slug: '', excerpt: '', content: '', category: 'design-stories', published: false, coverMedia: null };

export default function BlogEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft>(empty);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!id) return;
    api<BlogPost>(`/blog/id/${id}`)
      .then((p) =>
        setDraft({
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt ?? '',
          content: p.content ?? '',
          category: p.category,
          published: p.published,
          coverMedia: p.coverMedia ?? null,
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
      title: draft.title.trim(),
      slug: draft.slug.trim() || undefined,
      excerpt: draft.excerpt,
      content: draft.content,
      category: draft.category,
      published: draft.published,
      coverMedia: draft.coverMedia?._id ?? null,
    };
    try {
      if (id) await api(`/blog/${id}`, { method: 'PUT', body });
      else await api('/blog', { method: 'POST', body });
      toast('Post saved');
      navigate('/admin/blog');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="skeleton h-96" />;

  return (
    <form onSubmit={save}>
      <PageHeader
        title={id ? 'Edit post' : 'New post'}
        actions={
          <>
            <Link to="/admin/blog" className={smallBtn}>
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn-primary px-6 py-3">
              {saving ? 'Saving...' : 'Save post'}
            </button>
          </>
        }
      />
      <div className="grid gap-10 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Field label="Title *">
            <input required className={inputCls} value={draft.title} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label="Excerpt" hint="Short summary shown on journal cards and in search results.">
            <textarea rows={2} className={inputCls} value={draft.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
          </Field>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="field-label mb-0">Content (Markdown)</span>
              <button type="button" className={smallBtn} onClick={() => setPreview((p) => !p)}>
                {preview ? 'Edit' : 'Preview'}
              </button>
            </div>
            {preview ? (
              <div className="prose-editorial min-h-[360px] border border-taupe/50 p-5">
                <ReactMarkdown>{draft.content}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                rows={18}
                className={`${inputCls} font-mono text-[13px] leading-relaxed`}
                value={draft.content}
                onChange={(e) => set('content', e.target.value)}
                placeholder={'## A heading\n\nA paragraph. **Bold**, *italic*, [a link](https://...).\n\n> A quote\n\n![Image alt](https://image-url)'}
              />
            )}
          </div>
        </div>
        <div className="space-y-5">
          <Field label="Category">
            <select className={inputCls} value={draft.category} onChange={(e) => set('category', e.target.value)}>
              {Object.entries(BLOG_CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="URL slug" hint="Leave empty to generate from the title.">
            <input className={inputCls} value={draft.slug} onChange={(e) => set('slug', e.target.value)} />
          </Field>
          <Toggle checked={draft.published} onChange={(v) => set('published', v)} label="Published" />
          <div>
            <span className="field-label">Cover media</span>
            {draft.coverMedia ? <MediaThumb media={draft.coverMedia} ratio="4/3" /> : <div className="aspect-[4/3] bg-sand" />}
            <div className="mt-2 flex gap-2">
              <button type="button" className={smallBtn} onClick={() => setPicker(true)}>
                Choose
              </button>
              {draft.coverMedia && (
                <button type="button" className={smallBtn} onClick={() => set('coverMedia', null)}>
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <MediaPicker
        open={picker}
        multiple={false}
        title="Choose cover media"
        initial={draft.coverMedia ? [draft.coverMedia._id] : []}
        onClose={() => setPicker(false)}
        onSelect={(items) => set('coverMedia', items[0] ?? null)}
      />
    </form>
  );
}
