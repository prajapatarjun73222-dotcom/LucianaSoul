import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import SectionHeading from '../components/SectionHeading';
import TextTabs from '../components/TextTabs';
import MediaView from '../components/MediaView';
import Reveal from '../components/Reveal';
import { api } from '../lib/api';
import { BLOG_CATEGORY_LABELS, formatDate } from '../lib/labels';
import type { BlogPost, Paged } from '../types';

const clean = (t: string) => t.replace(/^\[Placeholder\]\s*/, '');

export default function Journal() {
  const [params, setParams] = useSearchParams();
  const active = params.get('category') ?? 'all';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api<Paged<BlogPost>>(`/blog?category=${active}&page=${page}&limit=9`)
      .then((res) => {
        if (cancelled) return;
        setPosts((prev) => (page === 1 ? res.items : [...prev, ...res.items]));
        setPages(res.pages);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [active, page]);

  const tabs = [{ key: 'all', label: 'All' }, ...Object.entries(BLOG_CATEGORY_LABELS).map(([key, label]) => ({ key, label }))];
  const [lead, ...rest] = posts;

  return (
    <>
      <Seo title="The Journal" description="Design stories, up-cycling, fabric stories and behind-the-scenes moments from the LucianaSoul studio in London." />
      <section className="container-editorial pb-10 pt-12 lg:pt-20">
        <SectionHeading as="h1" label="Stories" title="The Journal" subtitle="Notes from the LucianaSoul studio." />
        <TextTabs
          tabs={tabs}
          active={active}
          onChange={(key) => {
            setPage(1);
            setPosts([]);
            setParams(key === 'all' ? {} : { category: key }, { replace: true });
          }}
          className="mt-12 border-b border-taupe/30 pb-5"
        />
      </section>

      <section className="container-editorial">
        {loading && posts.length === 0 ? (
          <div className="grid gap-10 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <div className="skeleton" style={{ aspectRatio: '4/5' }} />
                <div className="skeleton mt-4 h-6 w-2/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="py-24 text-center font-serif text-2xl italic text-deep">New stories are on their way.</p>
        ) : (
          <>
            {lead && (
              <Reveal>
                <Link to={`/journal/${lead.slug}`} className="group grid items-center gap-8 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <MediaView media={lead.coverMedia} ratio="16/11" className="zoom-hover" sizes="(min-width: 1024px) 58vw, 100vw" eager />
                  </div>
                  <div className="lg:col-span-4 lg:col-start-9">
                    <p className="label text-taupe">
                      {BLOG_CATEGORY_LABELS[lead.category]} · {formatDate(lead.publishedAt)}
                    </p>
                    <h2 className="mt-4 font-serif text-4xl leading-tight text-ink sm:text-5xl">{clean(lead.title)}</h2>
                    {lead.excerpt && <p className="mt-5 leading-relaxed text-deep">{lead.excerpt}</p>}
                    <span className="label link-underline mt-8 inline-block text-ink">Read the story</span>
                  </div>
                </Link>
              </Reveal>
            )}
            {rest.length > 0 && (
              <div className="mt-20 grid gap-x-8 gap-y-16 md:grid-cols-3">
                {rest.map((post, i) => (
                  <Reveal key={post._id} delay={(i % 3) * 120} className={i % 3 === 1 ? 'md:mt-16' : ''}>
                    <Link to={`/journal/${post.slug}`} className="group block">
                      <MediaView media={post.coverMedia} ratio="4/5" className="zoom-hover" sizes="(min-width: 768px) 33vw, 100vw" />
                      <p className="label mt-5 text-taupe">
                        {BLOG_CATEGORY_LABELS[post.category]} · {formatDate(post.publishedAt)}
                      </p>
                      <h3 className="mt-2 font-serif text-2xl text-ink">{clean(post.title)}</h3>
                      {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-deep">{post.excerpt}</p>}
                    </Link>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
        {page < pages && (
          <div className="mt-20 text-center">
            <button type="button" className="btn-outline" disabled={loading} onClick={() => setPage((p) => p + 1)}>
              {loading ? 'Loading...' : 'More stories'}
            </button>
          </div>
        )}
      </section>
    </>
  );
}
