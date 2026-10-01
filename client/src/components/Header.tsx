import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { instagramUrl, useSettings } from '../lib/settings';
import { CloseIcon, InstagramIcon, MenuIcon } from './Icons';
import { BotanicalSprig } from './Botanical';

const NAV = [
  { to: '/collection', label: 'Collection' },
  { to: '/bespoke', label: 'Bespoke' },
  { to: '/about', label: 'About' },
  { to: '/journal', label: 'Journal' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { contact } = useSettings();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors duration-500 ${
          scrolled ? 'border-b border-taupe/25 bg-cream/95 backdrop-blur-sm' : 'border-b border-transparent bg-cream'
        }`}
      >
        <div className="container-editorial grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:h-20">
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV.slice(0, 3).map((item) => (
              <NavLink key={item.to} to={item.to} className="label link-underline text-ink">
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="-ml-1 justify-self-start p-1 text-ink lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          <Link to="/" className="flex items-center gap-3" aria-label="LucianaSoul home">
            <img src="/logo.png" alt="" className="hidden h-9 w-9 object-cover mix-blend-multiply sm:block lg:h-11 lg:w-11" />
            <span className="font-serif text-lg uppercase tracking-[0.24em] text-deep sm:text-xl lg:text-2xl lg:tracking-[0.28em]">
              LucianaSoul
            </span>
          </Link>

          <div className="flex items-center justify-end gap-8">
            <nav className="hidden items-center gap-8 lg:flex" aria-label="Secondary">
              {NAV.slice(3).map((item) => (
                <NavLink key={item.to} to={item.to} className="label link-underline text-ink">
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <a
              href={instagramUrl(contact.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LucianaSoul on Instagram"
              className="text-ink transition-opacity hover:opacity-60"
            >
              <InstagramIcon className="h-[18px] w-[18px]" />
            </a>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 bg-cream transition-opacity duration-500 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      >
        <div className="container-editorial flex h-16 items-center justify-between">
          <span className="font-serif text-xl uppercase tracking-[0.28em] text-deep">LucianaSoul</span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="p-1">
            <CloseIcon />
          </button>
        </div>
        <nav className="container-editorial mt-10 flex flex-col gap-5" aria-label="Mobile">
          {[{ to: '/', label: 'Home' }, ...NAV].map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={`font-serif text-5xl font-light uppercase text-ink transition-all duration-700 ${
                open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: `${open ? 80 + i * 50 : 0}ms` }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="container-editorial absolute bottom-10 flex items-end justify-between">
          <div className="space-y-2">
            <a href={instagramUrl(contact.instagram)} target="_blank" rel="noopener noreferrer" className="label flex items-center gap-2">
              <InstagramIcon className="h-4 w-4" /> @{contact.instagram}
            </a>
            <a href={`mailto:${contact.email}`} className="label block normal-case tracking-wide">
              {contact.email}
            </a>
          </div>
          <BotanicalSprig className="h-32 w-12 text-taupe" />
        </div>
      </div>
    </>
  );
}
