import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import MediaView from '../components/MediaView';
import Reveal from '../components/Reveal';
import { BotanicalDivider, DressFormMark } from '../components/Botanical';
import { useSettings } from '../lib/settings';
import type { Media } from '../types';

const SECTIONS = [
  { key: 'designer', label: '01', title: 'The Designer' },
  { key: 'philosophy', label: '02', title: 'The Philosophy' },
  { key: 'upcycling', label: '03', title: 'Up-cycling' },
  { key: 'bespoke', label: '04', title: 'Bespoke Design' },
  { key: 'london', label: '05', title: 'London' },
] as const;

export default function About() {
  const { settings, loading } = useSettings();
  const about = settings?.about ?? {};
  const pool: Media[] = [
    ...(about.designerMedia ? [about.designerMedia] : []),
    ...(settings?.homepage?.sustainability ?? []),
    ...(settings?.homepage?.bespoke ?? []),
    ...(settings?.homepage?.featuredCollection ?? []),
  ].filter((m, i, arr) => arr.findIndex((x) => x._id === m._id) === i);
  const filled = SECTIONS.filter((s) => (about[s.key] ?? '').trim());

  return (
    <>
      <Seo
        title="About"
        description="The story behind LucianaSoul, an independent London fashion designer creating unique, bespoke and up-cycled clothing."
      />

      <section className="container-editorial grid gap-10 pb-16 pt-12 lg:grid-cols-12 lg:pt-20">
        <div className="flex flex-col justify-end lg:col-span-6">
          <p className="label animate-fadeUp text-taupe">About LucianaSoul</p>
          <h1 className="display-hero mt-6 animate-fadeUp [animation-delay:120ms]">
            The story
            <br />
            behind
            <br />
            LucianaSoul
          </h1>
          <p className="mt-8 max-w-md animate-fadeUp leading-relaxed text-deep [animation-delay:240ms]">
            An independent London fashion designer creating unique outfits, bespoke designs and up-cycled clothing from reused
            textiles.
          </p>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <MediaView media={pool[0]} ratio="4/5" eager sizes="(min-width: 1024px) 42vw, 100vw" imgClassName="animate-slowZoom" />
        </div>
      </section>

      {!loading && filled.length === 0 && (
        <section className="container-editorial py-16 text-center">
          <DressFormMark className="mx-auto h-28 w-20 text-taupe" />
          <p className="mx-auto mt-8 max-w-xl font-serif text-2xl italic text-deep">
            Wear something that tells your story. Explore the pieces, or start a conversation about something made just for you.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/collection" className="btn-primary">
              Explore the collection
            </Link>
            <Link to="/contact" className="btn-outline">
              Contact LucianaSoul
            </Link>
          </div>
        </section>
      )}

      {filled.map((section, i) => {
        const media = pool[i + 1];
        const flip = i % 2 === 1;
        return (
          <section key={section.key} className={`${i % 2 === 0 ? 'bg-sand' : ''} py-20 lg:py-28`}>
            <div className="container-editorial grid items-center gap-12 lg:grid-cols-12">
              <Reveal className={`lg:col-span-5 ${flip ? 'lg:order-2 lg:col-start-8' : ''}`}>
                <p className="label text-taupe">{section.label}</p>
                <h2 className="display mt-4 text-5xl sm:text-6xl">{section.title}</h2>
                <BotanicalDivider className="mt-6 h-6 w-32 text-taupe" />
                <div className="mt-8 space-y-5 leading-relaxed text-deep">
                  {(about[section.key] ?? '').split(/\n{2,}/).map((para, j) => (
                    <p key={j} className="whitespace-pre-line">
                      {para}
                    </p>
                  ))}
                </div>
              </Reveal>
              {media && (
                <Reveal variant="image" className={`lg:col-span-6 ${flip ? 'lg:order-1' : 'lg:col-start-7'}`}>
                  <MediaView media={media} ratio={i % 2 ? '1/1' : '4/5'} sizes="(min-width: 1024px) 50vw, 100vw" />
                </Reveal>
              )}
            </div>
          </section>
        );
      })}

      <section className="container-editorial py-20 text-center">
        <Reveal>
          <p className="display mx-auto max-w-3xl text-4xl sm:text-5xl">Let's create something beautiful.</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/bespoke" className="btn-primary">
              Request a bespoke design
            </Link>
            <Link to="/contact" className="btn-outline">
              Contact LucianaSoul
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
