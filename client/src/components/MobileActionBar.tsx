import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../lib/settings';
import { whatsappLink, waMessages } from '../lib/whatsapp';
import { WhatsAppIcon } from './Icons';

/** Sticky bottom bar on mobile: the shortest path from Instagram traffic to an enquiry. */
export default function MobileActionBar() {
  const { contact } = useSettings();
  const { pathname } = useLocation();
  const message = pathname.startsWith('/bespoke') ? waMessages.bespoke : waMessages.general;
  // Product pages render their own piece-specific bar.
  if (/^\/collection\/.+/.test(pathname)) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-taupe/30 bg-cream/95 backdrop-blur-sm lg:hidden">
      <Link to="/enquiry" className="label flex h-14 items-center justify-center text-ink">
        Enquire
      </Link>
      <a
        href={whatsappLink(contact.whatsapp, message)}
        target="_blank"
        rel="noopener noreferrer"
        className="label flex h-14 items-center justify-center gap-2 bg-ink text-cream"
      >
        <WhatsAppIcon /> WhatsApp
      </a>
    </div>
  );
}
