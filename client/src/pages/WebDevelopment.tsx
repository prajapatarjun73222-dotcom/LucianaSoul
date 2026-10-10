import { useState, type FormEvent } from 'react';
import Seo from '../components/Seo';
import Reveal from '../components/Reveal';
import { WhatsAppIcon } from '../components/Icons';
import HumanCheck, { humanCheckEnabled } from '../components/HumanCheck';
import { api } from '../lib/api';
import { DEV_SERVICE_LABELS } from '../lib/labels';
import { useSettings } from '../lib/settings';
import { whatsappLink, waMessages } from '../lib/whatsapp';
import NotFound from './NotFound';

const SERVICES = [
  ['New website', 'Designed and built from scratch, fast on mobile, easy to update yourself.'],
  ['Redesign', 'Give an existing site a fresh, modern look without losing what works.'],
  ['Bug fixes', 'Something broken, slow or not showing properly? I will track it down and fix it.'],
  ['Maintenance', 'Ongoing updates, new pages and features, and keeping everything running smoothly.'],
] as const;

type State = 'idle' | 'sending' | 'sent' | 'error';

export default function WebDevelopment() {
  const { settings, loading } = useSettings();
  const dev = settings?.developer;
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');
  const [startedAt] = useState(() => Date.now());
  const [humanToken, setHumanToken] = useState('');
  const [checkKey, setCheckKey] = useState(0);

  if (loading) return <div className="min-h-[70vh]" aria-busy="true" />;
  if (!dev?.enabled) return <NotFound />;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? '').trim();
    if (humanCheckEnabled && !humanToken) {
      setError('Please complete the quick human check above the button.');
      setState('error');
      return;
    }
    setState('sending');
    setError('');
    try {
      await api('/developer-leads', {
        method: 'POST',
        auth: false,
        body: {
          name: get('name'),
          email: get('email'),
          whatsapp: get('whatsapp'),
          service: get('service'),
          message: get('message'),
          website: get('website'),
          startedAt,
          turnstileToken: humanToken || undefined,
        },
      });
      setState('sent');
    } catch (err) {
      setError((err as Error).message);
      setState('error');
      setHumanToken('');
      setCheckKey((k) => k + 1);
    }
  }

  const waHref = dev.whatsapp ? whatsappLink(dev.whatsapp, waMessages.developer(dev.name || 'there')) : '';

  return (
    <>
      <Seo title="Web development" description={dev.intro} noindex />

      <section className="container-editorial pb-12 pt-12 lg:pt-20">
        <p className="label animate-fadeUp text-taupe">Web design & development{dev.name ? ` by ${dev.name}` : ''}</p>
        <h1 className="display mt-6 animate-fadeUp text-[11vw] [animation-delay:120ms] sm:text-7xl xl:text-8xl">{dev.headline}</h1>
        {dev.intro && <p className="mt-8 max-w-2xl animate-fadeUp text-lg leading-relaxed text-deep [animation-delay:200ms]">{dev.intro}</p>}
      </section>

      <section className="container-editorial grid gap-px bg-taupe/30 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map(([title, text]) => (
          <Reveal key={title} className="bg-cream p-6 sm:p-8">
            <h2 className="font-serif text-2xl uppercase tracking-wide">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-deep">{text}</p>
          </Reveal>
        ))}
      </section>

      <section className="container-editorial grid gap-16 py-16 lg:grid-cols-12">
        <Reveal className="space-y-10 lg:col-span-4">
          {waHref && (
            <div>
              <p className="label mb-3 text-taupe">Fastest reply</p>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-3">
                <WhatsAppIcon /> Chat on WhatsApp
              </a>
            </div>
          )}
          {dev.email && (
            <div>
              <p className="label mb-3 text-taupe">Email</p>
              <a href={`mailto:${dev.email}`} className="link-underline break-all font-serif text-2xl text-ink">
                {dev.email}
              </a>
            </div>
          )}
          {dev.portfolioUrl && (
            <div>
              <p className="label mb-3 text-taupe">More of my work</p>
              <a href={dev.portfolioUrl} target="_blank" rel="noopener noreferrer" className="link-underline font-serif text-2xl text-ink">
                View portfolio
              </a>
            </div>
          )}
          <p className="text-sm leading-relaxed text-deep">You are looking at one of my projects: this LucianaSoul website, including its admin panel.</p>
        </Reveal>

        <div className="lg:col-span-7 lg:col-start-6">
          {state === 'sent' ? (
            <div className="border border-taupe/40 p-8 text-center sm:p-12" role="status">
              <p className="label mb-4 text-taupe">Thank you</p>
              <h2 className="mb-4 font-serif text-3xl uppercase sm:text-4xl">Your message has been sent.</h2>
              <p className="mx-auto max-w-md text-deep">I will get back to you soon.</p>
              {waHref && (
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-outline mt-8 inline-flex items-center gap-3">
                  <WhatsAppIcon /> Continue on WhatsApp
                </a>
              )}
            </div>
          ) : (
            <>
              <p className="label mb-8 text-taupe">Tell me about your project</p>
              <form onSubmit={onSubmit} className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                <label className="block">
                  <span className="field-label">Name *</span>
                  <input name="name" required autoComplete="name" className="field" />
                </label>
                <label className="block">
                  <span className="field-label">Email *</span>
                  <input name="email" type="email" required autoComplete="email" className="field" />
                </label>
                <label className="block">
                  <span className="field-label">WhatsApp number</span>
                  <input name="whatsapp" type="tel" autoComplete="tel" className="field" />
                </label>
                <label className="block">
                  <span className="field-label">What do you need?</span>
                  <select name="service" className="field" defaultValue="new_website">
                    {Object.entries(DEV_SERVICE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="field-label">Message *</span>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    className="field resize-y"
                    placeholder="Your business, what you have now, what you would like..."
                  />
                </label>
                <HumanCheck key={checkKey} onToken={setHumanToken} className="sm:col-span-2" />
                {state === 'error' && (
                  <p className="text-sm text-[#8a4b3c] sm:col-span-2" role="alert">
                    {error || 'Something went wrong. Please try again or reach me on WhatsApp.'}
                  </p>
                )}
                <div className="sm:col-span-2">
                  <button type="submit" disabled={state === 'sending'} className="btn-primary disabled:opacity-60">
                    {state === 'sending' ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </>
  );
}
