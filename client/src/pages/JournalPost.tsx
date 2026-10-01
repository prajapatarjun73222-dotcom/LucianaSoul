import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Seo from '../components/Seo';
import MediaView, { posterOf } from '../components/MediaView';
import Reveal from '../components/Reveal';
import { BotanicalDivider } from '../components/Botanical';
import { useFetch } from '../lib/useFetch';
import { BLOG_CATEGORY_LABELS, formatDate } from '../lib/labels';
import type { BlogPost } from '../types';
import NotFound from './NotFound';

const clean = (t: string) => t.replace(/^\[Placeholder\]\s*/, '');

export default function JournalPost() {
  const { slug } = useParams();
  const { data: post, loading, error } = useFetch<BlogPost>(`/blog/${slug}`);

  if (error) return <NotFound />;
  if (loading || !post) {
    return (
      <div className="container-editorial max-w-3xl space-y-6 py-16">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-16 w-full" />
        <div className="skeleton" style={{ aspectRatio: '16/9' }} />
      </div>
    );
  }

  const title = clean(post.title);
  const image = posterOf(post.coverMedia);
  const origin = window.location.origin;

  return (
    <article>
      <Seo
        title={title}
        description={post.excerpt}
        image={image || undefined}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description: post.excerpt || undefined,
          image: image ? [image] : undefined,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          author: { '@type': 'Organization', name: 'LucianaSoul' },
          publisher: { '@type': 'Organization', name: 'LucianaSoul', logo: { '@type': 'ImageObject', url: `${origin}/logo.png` } },
          mainEntityOfPage: `${origin}/journal/${post.slug}`,
        }}
      />

      <header className="container-editorial max-w-4xl pb-12 pt-12 text-center lg:pt-20">
        <p className="label animate-fadeUp text-taupe">
          <Link to={`/journal?category=${post.category}`} className="link-underline">
            {BLOG_CATEGORY_LABELS[post.category]}
          </Link>{' '}
          · {formatDate(post.publishedAt)}
        </p>
        <h1 className="mt-6 animate-fadeUp font-serif text-5xl font-light leading-[1.05] text-ink [animation-delay:120ms] sm:text-7xl">{title}</h1>
        {post.excerpt && (
          <p className="mx-auto mt-8 max-w-2xl animate-fadeUp font-serif text-xl italic text-deep [animation-delay:240ms] sm:text-2xl">
            {post.excerpt}
          </p>
        )}
      </header>

      {post.coverMedia && (
        <div className="container-editorial">
          <MediaView media={post.coverMedia} ratio="16/9" eager interactive sizes="100vw" imgClassName="animate-slowZoom" />
        </div>
      )}

      <div className="container-editorial max-w-2xl py-16">
        <div className="prose-editorial">
          <ReactMarkdown>{post.content ?? ''}</ReactMarkdown>
        </div>
        <BotanicalDivider className="mx-auto mt-16 h-6 w-36 text-taupe" />
      </div>

      {post.more && post.more.length > 0 && (
        <section className="container-editorial border-t border-taupe/30 py-16">
          <p className="label mb-10 text-taupe">More from the journal</p>
          <div className="grid gap-10 md:grid-cols-2">
            {post.more.map((p) => (
              <Reveal key={p._id}>
                <Link to={`/journal/${p.slug}`} className="group grid grid-cols-5 items-center gap-6">
                  <div className="col-span-2">
                    <MediaView media={p.coverMedia} ratio="4/5" className="zoom-hover" sizes="200px" />
                  </div>
                  <div className="col-span-3">
                    <p className="label text-taupe">{BLOG_CATEGORY_LABELS[p.category]}</p>
                    <h3 className="mt-2 font-serif text-2xl text-ink">{clean(p.title)}</h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
