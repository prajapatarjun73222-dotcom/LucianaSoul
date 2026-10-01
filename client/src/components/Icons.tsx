type P = { className?: string };

export const InstagramIcon = ({ className = 'h-4 w-4' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className={className} aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);

export const WhatsAppIcon = ({ className = 'h-4 w-4' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className={className} aria-hidden>
    <path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.4-4.2a8.5 8.5 0 1 1 15.6-4.5Z" strokeLinejoin="round" />
    <path
      d="M9 8.3c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .5.6 1 1.4 1.8 2.5 2.4.2.1.4.1.5 0l.6-.6c.2-.2.4-.2.6-.1l1.7.8c.2.1.3.3.3.5v.5c0 .3-.1.6-.4.8-.6.4-1.4.6-2.2.4-2.6-.7-4.7-2.8-5.4-5.4-.2-.8 0-1.6.4-2.2Z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

export const PlayIcon = ({ className = 'h-4 w-4' }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M7 4.5v15l12-7.5-12-7.5Z" />
  </svg>
);

export const ArrowIcon = ({ className = 'h-3 w-6' }: P) => (
  <svg viewBox="0 0 32 12" fill="none" stroke="currentColor" strokeWidth="1" className={className} aria-hidden>
    <path d="M0 6h31M26 1l5 5-5 5" />
  </svg>
);

export const MenuIcon = ({ className = 'h-5 w-6' }: P) => (
  <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.1" className={className} aria-hidden>
    <path d="M0 4h24M0 12h24" />
  </svg>
);

export const CloseIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.1" className={className} aria-hidden>
    <path d="M3 3l14 14M17 3 3 17" />
  </svg>
);
