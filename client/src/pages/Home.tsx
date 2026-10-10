import { Link } from 'react-router-dom';
import Seo, { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from '../components/Seo';
import MediaView, { posterOf } from '../components/MediaView';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import EditorialPiece from '../components/EditorialPiece';
import WhatsAppButton from '../components/WhatsAppButton';
import { BotanicalDivider, BotanicalSprig } from '../components/Botanical';
import { ArrowIcon, InstagramIcon } from '../components/Icons';
import { instagramUrl, useSettings } from '../lib/settings';
import { useFetch } from '../lib/useFetch';
import { waMessages } from '../lib/whatsapp';
import { BLOG_CATEGORY_LABELS, formatDate } from '../lib/labels';
import type { BlogPost, Media, Paged, Product } from '../types';

const PIECE_LAYOUT = [
  { cls: 'md:col-span-7', ratio: '4/5' },
  { cls: 'md:col-span-5 md:mt-40', ratio: '3/4' },
  { cls: 'md:col-span-4', ratio: '1/1' },
  { cls: 'md:col-span-8 md:-mt-24', ratio: '16/11' },
  { cls: 'md:col-span-5 md:col-start-2', ratio: '3/4' },
  { cls: 'md:col-span-5 md:col-start-8 md:mt-32', ratio: '4/5' },
];

const SUSTAINABILITY_LABELS = ['Up-cycled textiles', 'Individual design', 'Bespoke craft', 'Designed in London'];

export default function Home() {
  const { settings, loading } = useSettings();
  const slots = settings?.homepage;
  const hero = slots?.hero?.[0];
  const { data: featured } = useFetch<Paged<Product>>('/products?featured=true&limit=6');
  const { data: posts } = useFetch<Paged<BlogPost>>('/blog?limit=3');

  return (
    <>
      <Seo
        title={undefined}
        description={settings?.seo?.description || DEFAULT_DESCRIPTION}
        image={posterOf(hero) || undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ClothingStore',
          name: 'LucianaSoul',
          description: DEFAULT_DESCRIPTION,
          url: typeof window !== 'undefined' ? window.location.origin : undefined,
          telephone: '+44 7454 720895',
          email: 'pulciniluciana@gmail.com',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '210/212 Southwark Park Road',
            addressLocality: 'London',
            postalCode: 'SE16 3RX',
            addressCountry: 'GB',
          },
          sameAs: ['https://www.instagram.com/luciana_soul/'],
          alternateName: DEFAULT_TITLE,
        }}
      />

      {/* HERO */}
      <section className="relative">
        <div className="container-editorial grid items-stretch gap-10 pb-16 pt-6 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-12 lg:gap-12 lg:pb-12">
          <div className="relative z-10 flex flex-col justify-center lg:col-span-5 lg:py-16">
            <p className="label animate-fadeUp text-taupe">London • Bespoke • Upcycled</p>
            <h1 className="display-hero mt-6 animate-fadeUp text-ink [animation-delay:120ms]">
              Wear something
              <br />
              that feels
              <br />
              <em className="font-light italic normal-case tracking-normal">uniquely you.</em>
            </h1>
            <p className="mt-8 max-w-md animate-fadeUp text-[16px] leading-relaxed text-deep [animation-delay:240ms]">
              Unique clothing and bespoke designs created with imagination, individuality and a more thoughtful approach to
              fashion.
            </p>
            <div className="mt-10 flex animate-fadeUp flex-col gap-3 [animation-delay:360ms] sm:flex-row sm:flex-wrap">
              <Link to="/collection" className="btn-primary">
                Explore the collection
              </Link>
              <Link to="/bespoke" className="btn-outline">
                Request a bespoke design
              </Link>
            </div>
            <BotanicalSprig className="pointer-events-none absolute right-2 top-6 hidden h-44 w-16 text-taupe/50 xl:block" />
          </div>

          <div className="relative lg:col-span-7">
            <div className="relative h-full min-h-[60vh] overflow-hidden lg:min-h-0">
              {loading ? (
                <div className="skeleton absolute inset-0" />
              ) : (
                <MediaView
                  media={hero}
                  eager
                  interactive
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="absolute inset-0 h-full"
                  imgClassName="animate-slowZoom"
                />
              )}
            </div>
            {hero?.caption && hero.kind === 'image' && !hero.title?.startsWith('[Placeholder]') && (
              <p className="label mt-3 text-right text-taupe">{hero.caption}</p>
            )}
          </div>
        </div>
      </section>

      {/* STATEMENT */}
      <section className="container-editorial py-20 text-center lg:py-32">
        <Reveal>
          <BotanicalDivider className="mx-auto mb-10 h-7 w-44 text-taupe" />
          <p className="display mx-auto max-w-5xl text-4xl text-ink sm:text-6xl lg:text-7xl">
            Wear something that tells your story.
          </p>
          <p className="mx-auto mt-8 max-w-xl text-deep">
            Individual pieces, bespoke commissions and up-cycled clothing, designed in London by LucianaSoul.
          </p>
        </Reveal>
      </section>

      {/* COLLECTION */}
      <section className="container-editorial py-12 lg:py-20">
        <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading label="Featured" title="The Collection" subtitle="Pieces with a story." />
          <Reveal>
            <Link to="/collection" className="label link-underline flex items-center gap-3 text-ink">
              View all pieces <ArrowIcon />
            </Link>
          </Reveal>
        </div>
        {featured && featured.items.length > 0 ? (
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-12 md:gap-y-20">
            {featured.items.map((p, i) => {
              const layout = PIECE_LAYOUT[i % PIECE_LAYOUT.length];
              return (
                <EditorialPiece
                  key={p._id}
                  product={p}
                  ratio={layout.ratio}
                  index={i}
                  className={layout.cls}
                  sizes="(min-width: 768px) 55vw, 100vw"
                />
              );
            })}
          </div>
        ) : (
          <MediaMosaic items={slots?.featuredCollection ?? []} />
        )}
      </section>

      {/* EDITORIAL INTERLUDE */}
      {slots?.featuredCollection?.[0] && (
        <section className="my-16 lg:my-24">
          <Reveal variant="image" className="relative">
            <MediaView media={slots.featuredCollection[0]} ratio="21/9" sizes="100vw" className="min-h-[50vh] w-full" />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/50 via-transparent to-transparent">
              <div className="container-editorial pb-10 text-cream lg:pb-16">
                <p className="label text-cream/80">Made in London</p>
                <p className="display mt-3 max-w-3xl text-4xl sm:text-6xl">Every piece carries its own character.</p>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* SUSTAINABILITY */}
      <section className="bg-sand py-20 lg:py-32">
        <div className="container-editorial grid items-center gap-12 lg:grid-cols-12">
          <div className="grid grid-cols-2 gap-4 lg:col-span-6">
            {(slots?.sustainability ?? []).slice(0, 2).map((m, i) => (
              <Reveal key={m._id} variant="image" delay={i * 150} className={i === 1 ? 'mt-16' : ''}>
                <MediaView media={m} ratio="3/4" sizes="(min-width: 1024px) 25vw, 50vw" />
              </Reveal>
            ))}
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <SectionHeading
              label="Up-cycling"
              title={
                <>
                  Fashion with
                  <br />a second story.
                </>
              }
            />
            <Reveal delay={100}>
              <p className="mt-8 leading-relaxed text-deep">
                {settings?.sustainabilityText ||
                  'Up-cycled pieces begin with textiles that already have a history. LucianaSoul reimagines them into new, individual designs, so that every garment carries its own character.'}
              </p>
              <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-taupe/40 pt-8">
                {SUSTAINABILITY_LABELS.map((l) => (
                  <li key={l} className="label text-ink">
                    {l}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* BESPOKE */}
      <section className="container-editorial grid items-center gap-12 py-20 lg:grid-cols-12 lg:py-32">
        <div className="order-2 lg:order-1 lg:col-span-5">
          <SectionHeading
            label="Bespoke"
            title={
              <>
                Bespoke,
                <br />
                made for you.
              </>
            }
          />
          <Reveal delay={100}>
            <p className="mt-8 max-w-md leading-relaxed text-deep">
              Have an idea in mind? LucianaSoul creates individual pieces designed around you, your measurements and your
              vision.
            </p>
            <ol className="mt-10 space-y-4 border-t border-taupe/40 pt-8">
              {['Share your idea', 'Discuss your design', 'Measure & refine', 'Create your piece'].map((s, i) => (
                <li key={s} className="flex items-baseline gap-6">
                  <span className="font-serif text-xl text-taupe">{String(i + 1).padStart(2, '0')}</span>
                  <span className="label text-ink">{s}</span>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link to="/bespoke" className="btn-primary">
                Start a bespoke enquiry
              </Link>
              <WhatsAppButton message={waMessages.bespoke} label="Discuss on WhatsApp" />
            </div>
          </Reveal>
        </div>
        <Reveal variant="image" className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7">
          <MediaView media={slots?.bespoke?.[0]} ratio="4/5" sizes="(min-width: 1024px) 50vw, 100vw" interactive />
        </Reveal>
      </section>

      <InstagramSection items={slots?.instagram ?? []} />

      {/* JOURNAL */}
      {posts && posts.items.length > 0 && (
        <section className="container-editorial py-20 lg:py-28">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading label="Read" title="The Journal" />
            <Link to="/journal" className="label link-underline flex items-center gap-3 text-ink">
              All stories <ArrowIcon />
            </Link>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {posts.items.map((post, i) => (
              <Reveal key={post._id} delay={i * 120}>
                <Link to={`/journal/${post.slug}`} className="group block">
                  <MediaView media={post.coverMedia} ratio="4/5" className="zoom-hover" sizes="(min-width: 768px) 33vw, 100vw" />
                  <p className="label mt-5 text-taupe">
                    {BLOG_CATEGORY_LABELS[post.category]} · {formatDate(post.publishedAt)}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl text-ink group-hover:text-deep">{post.title.replace(/^\[Placeholder\]\s*/, '')}</h3>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function MediaMosaic({ items }: { items: Media[] }) {
  if (items.length === 0) return null;
  return (
    <div className="grid gap-x-8 gap-y-10 md:grid-cols-12">
      {items.slice(0, 6).map((m, i) => {
        const layout = PIECE_LAYOUT[i % PIECE_LAYOUT.length];
        return (
          <Reveal key={m._id} variant="image" className={layout.cls}>
            <MediaView media={m} ratio={layout.ratio} sizes="(min-width: 768px) 55vw, 100vw" />
          </Reveal>
        );
      })}
    </div>
  );
}

export function InstagramSection({ items }: { items: Media[] }) {
  const { contact } = useSettings();
  if (items.length === 0) return null;
  return (
    <section className="bg-sand py-20 lg:py-32">
      <div className="container-editorial">
        <div className="mb-14 grid gap-8 md:grid-cols-2 md:items-end">
          <SectionHeading
            label={`@${contact.instagram}`}
            title={
              <>
                From the
                <br />
                LucianaSoul studio
              </>
            }
            subtitle="Follow the latest pieces, designs and stories."
          />
          <Reveal className="md:justify-self-end md:text-right">
            <p className="label mb-3 text-taupe">Follow the journey</p>
            <p className="max-w-sm text-deep md:ml-auto">
              Discover new pieces, behind-the-scenes moments and the latest from the LucianaSoul studio.
            </p>
            <a
              href={instagramUrl(contact.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mt-6"
            >
              <InstagramIcon /> Follow @{contact.instagram}
            </a>
          </Reveal>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {items.slice(0, 5).map((m, i) => (
            <Reveal key={m._id} delay={(i % 4) * 90} variant="image" className={i === 0 ? 'col-span-2 md:row-span-2' : ''}>
              <MediaView media={m} ratio="1/1" className="h-full" sizes={i === 0 ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 50vw'} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
