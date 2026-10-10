import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import MediaView from '../components/MediaView';
import Reveal from '../components/Reveal';
import { BotanicalDivider } from '../components/Botanical';
import { useSettings } from '../lib/settings';
import { aboutMilestones, aboutPortrait, aboutText } from '../lib/aboutContent';
import type { Media } from '../types';

const SECTIONS = [
  { key: 'designer', title: 'The Designer' },
  { key: 'philosophy', title: 'The Philosophy' },
  { key: 'upcycling', title: 'Up-cycling' },
  { key: 'bespoke', title: 'Bespoke Design' },
  { key: 'london', title: 'London' },
] as const;

export default function About() {
  const { settings } = useSettings();
  const about = settings?.about;
  const portrait = aboutPortrait(about);
  const pool: Media[] = [
    portrait,
    ...(settings?.homepage?.sustainability ?? []),
    ...(settings?.homepage?.bespoke ?? []),
    ...(settings?.homepage?.featuredCollection ?? []),
  ].filter((m, i, arr) => arr.findIndex((x) => x._id === m._id) === i);
  const filled = SECTIONS.map((s) => ({ ...s, text: aboutText(about, s.key) })).filter((s) => s.text);
  const milestones = aboutMilestones(about);

  return (
    <>
      <Seo
        title="About"
        description="The story of Luciana Pulcini, the Italian-trained tailor behind LucianaSoul: unique, up-cycled and bespoke clothing made in London since 2016, with a cause at its heart."
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
            Founded in London in 2016 by Luciana Pulcini, an Italian-trained tailor creating unique outfits, bespoke designs and
            up-cycled clothing from reused textiles. Not just clothes: a cause.
          </p>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <MediaView media={portrait} ratio="4/5" eager sizes="(min-width: 1024px) 42vw, 100vw" imgClassName="animate-slowZoom" />
        </div>
      </section>

      {filled.map((section, i) => {
        const media = pool[i + 1];
        const flip = i % 2 === 1;
        return (
          <section key={section.key} className={`${i % 2 === 0 ? 'bg-sand' : ''} py-20 lg:py-28`}>
            <div className="container-editorial grid items-center gap-12 lg:grid-cols-12">
              <Reveal className={`lg:col-span-5 ${flip ? 'lg:order-2 lg:col-start-8' : ''}`}>
                <p className="label text-taupe">{String(i + 1).padStart(2, '0')}</p>
                <h2 className="display mt-4 text-5xl sm:text-6xl">{section.title}</h2>
                <BotanicalDivider className="mt-6 h-6 w-32 text-taupe" />
                <div className="mt-8 space-y-5 leading-relaxed text-deep">
                  {section.text.split(/\n{2,}/).map((para, j) => (
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

      <section className="bg-ink py-20 text-cream lg:py-28">
        <div className="container-editorial grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="label text-cream/70">Milestones</p>
            <h2 className="display mt-4 text-5xl sm:text-6xl">
              Not just clothes.
              <br />
              <em className="font-light italic normal-case tracking-normal">A cause.</em>
            </h2>
            <BotanicalDivider className="mt-6 h-6 w-32 text-cream/60" />
          </Reveal>
          <ol className="relative border-l border-cream/25 lg:col-span-7 lg:col-start-6">
            {milestones.map((m, i) => (
              <li key={`${m.date}-${i}`} className="relative pb-10 pl-8 last:pb-0 sm:pl-10">
                <span className="absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full bg-cream" aria-hidden />
                <Reveal delay={(i % 3) * 100}>
                  <p className="label text-cream/70">{m.date}</p>
                  <p className="mt-3 font-serif text-xl leading-snug sm:text-2xl">{m.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

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
