import { Link } from 'react-router-dom';
import { instagramUrl, useSettings } from '../lib/settings';
import { whatsappLink, waMessages } from '../lib/whatsapp';
import MediaView from './MediaView';
import { InstagramIcon, WhatsAppIcon } from './Icons';
import { BotanicalDivider } from './Botanical';

export default function Footer() {
  const { settings, contact } = useSettings();
  const gallery = (settings?.homepage?.footerGallery ?? []).slice(0, 6);

  return (
    <footer className="mt-24 bg-sand pb-24 lg:pb-0">
      {gallery.length > 0 && (
        <div
          className="grid grid-cols-[repeat(var(--cols-sm),minmax(0,1fr))] gap-px bg-stone md:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
          style={
            {
              '--cols': gallery.length,
              '--cols-sm': gallery.length % 3 === 0 ? 3 : Math.min(gallery.length, 4) === 4 ? 2 : gallery.length,
            } as React.CSSProperties
          }
        >
          {gallery.map((m) => (
            <a
              key={m._id}
              href={instagramUrl(contact.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              aria-label={m.alt || m.title || 'LucianaSoul on Instagram'}
            >
              <MediaView media={m} ratio="1/1" sizes="(min-width: 768px) 16vw, 33vw" className="zoom-hover" />
            </a>
          ))}
        </div>
      )}

      <div className="container-editorial grid gap-12 py-16 md:grid-cols-12 lg:py-20">
        <div className="md:col-span-5">
          <Link to="/" className="flex items-center gap-4">
            <img src="/logo.png" alt="LucianaSoul logo" className="h-20 w-20 object-cover mix-blend-multiply" loading="lazy" />
            <div>
              <p className="font-serif text-2xl uppercase tracking-[0.28em] text-deep">LucianaSoul</p>
              <p className="label mt-1 text-taupe">London • Bespoke • Up-cycled</p>
            </div>
          </Link>
          <BotanicalDivider className="mt-8 h-6 w-36 text-taupe" />
        </div>

        <div className="md:col-span-3">
          <p className="label mb-5 text-taupe">Explore</p>
          <ul className="space-y-3 text-sm">
            {[
              ['/collection', 'The Collection'],
              ['/bespoke', 'Bespoke'],
              ['/about', 'About'],
              ['/journal', 'Journal'],
              ['/contact', 'Contact'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="link-underline text-deep">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 text-sm text-deep md:col-span-4">
          <p className="label mb-5 text-taupe">The Studio</p>
          <address className="not-italic leading-relaxed">
            {contact.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="link-underline block w-fit">
            {contact.phone}
          </a>
          <a href={`mailto:${contact.email}`} className="link-underline block w-fit">
            {contact.email}
          </a>
          <div className="flex gap-6 pt-2">
            <a href={instagramUrl(contact.instagram)} target="_blank" rel="noopener noreferrer" className="label flex items-center gap-2 text-ink">
              <InstagramIcon /> @{contact.instagram}
            </a>
            <a
              href={whatsappLink(contact.whatsapp, waMessages.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="label flex items-center gap-2 text-ink"
            >
              <WhatsAppIcon /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="container-editorial flex flex-col gap-2 border-t border-taupe/30 py-6 text-xs text-taupe sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} LucianaSoul. All rights reserved.</p>
        <p>Designed and made in London.</p>
      </div>
    </footer>
  );
}
