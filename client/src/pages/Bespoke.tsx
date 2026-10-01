import Seo from '../components/Seo';
import MediaView from '../components/MediaView';
import Reveal from '../components/Reveal';
import EnquiryForm from '../components/EnquiryForm';
import WhatsAppButton from '../components/WhatsAppButton';
import { BotanicalSprig } from '../components/Botanical';
import { useSettings } from '../lib/settings';
import { waMessages } from '../lib/whatsapp';

const STEPS = [
  { title: 'Share your idea', text: 'Tell LucianaSoul about the piece you have in mind: the occasion, the feeling, any references.' },
  { title: 'Discuss your design', text: 'Talk through silhouettes, textiles and details together to shape the design.' },
  { title: 'Measure & refine', text: 'Measurements are taken and the design is refined around you.' },
  { title: 'Create your piece', text: 'Your piece is made individually, for you.' },
];

export default function Bespoke() {
  const { settings, contact } = useSettings();
  const media = settings?.homepage?.bespoke ?? [];

  return (
    <>
      <Seo
        title="Bespoke Design"
        description="Commission a bespoke piece from LucianaSoul in London: individual clothing designed around you, your measurements and your vision."
      />

      <section className="container-editorial grid gap-10 pb-16 pt-10 lg:grid-cols-12 lg:gap-12 lg:pt-16">
        <div className="relative flex flex-col justify-center lg:col-span-5">
          <p className="label animate-fadeUp text-taupe">Bespoke design</p>
          <h1 className="display-hero mt-6 animate-fadeUp text-ink [animation-delay:120ms]">
            Bespoke,
            <br />
            made for you.
          </h1>
          <p className="mt-8 max-w-md animate-fadeUp leading-relaxed text-deep [animation-delay:240ms]">
            Have an idea in mind? LucianaSoul creates individual pieces designed around you, your measurements and your vision.
          </p>
          <div className="mt-10 flex animate-fadeUp flex-col gap-3 [animation-delay:360ms] sm:flex-row sm:flex-wrap">
            <a href="#bespoke-enquiry" className="btn-primary">
              Start a bespoke enquiry
            </a>
            <WhatsAppButton message={waMessages.bespoke} label={`WhatsApp ${contact.phone}`} />
          </div>
        </div>
        <div className="lg:col-span-7">
          <MediaView media={media[0]} ratio="4/5" eager interactive sizes="(min-width: 1024px) 58vw, 100vw" imgClassName="animate-slowZoom" />
        </div>
      </section>

      <section className="bg-sand py-20 lg:py-28">
        <div className="container-editorial">
          <Reveal>
            <p className="label text-taupe">The process</p>
            <h2 className="display mt-4 text-5xl sm:text-6xl">Four steps</h2>
          </Reveal>
          <ol className="mt-14 grid gap-px bg-taupe/30 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 120} className="bg-sand p-8 lg:p-10">
                <span className="font-serif text-6xl font-light text-taupe">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="label mt-8 text-[12px] text-ink">{step.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-deep">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {media.length > 1 && (
        <section className="container-editorial grid gap-6 py-16 sm:grid-cols-3">
          {media.slice(1, 4).map((m, i) => (
            <Reveal key={m._id} variant="image" delay={i * 120} className={i === 1 ? 'sm:mt-16' : ''}>
              <MediaView media={m} ratio="3/4" sizes="(min-width: 640px) 33vw, 100vw" />
            </Reveal>
          ))}
        </section>
      )}

      <section id="bespoke-enquiry" className="container-editorial scroll-mt-24 py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="relative lg:col-span-4">
            <p className="label text-taupe">Begin</p>
            <h2 className="display mt-4 text-5xl sm:text-6xl">Start a bespoke enquiry</h2>
            <p className="mt-6 leading-relaxed text-deep">
              Share as much or as little as you like. LucianaSoul will be in touch to talk through your design.
            </p>
            <p className="mt-8 text-sm text-deep">
              Prefer to talk? <br />
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="link-underline font-serif text-2xl text-ink">
                {contact.phone}
              </a>
            </p>
            <BotanicalSprig className="mt-12 hidden h-48 w-16 text-taupe/70 lg:block" />
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <EnquiryForm variant="bespoke" />
          </div>
        </div>
      </section>
    </>
  );
}
