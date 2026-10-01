import type { ReactNode } from 'react';
import Reveal from './Reveal';

interface Props {
  label?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
  as?: 'h1' | 'h2';
}

export default function SectionHeading({ label, title, subtitle, align = 'left', className = '', as: H = 'h2' }: Props) {
  return (
    <Reveal className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
      {label && <p className="label mb-5 text-taupe">{label}</p>}
      <H className="display text-[44px] text-ink sm:text-6xl lg:text-7xl">{title}</H>
      {subtitle && <p className="mt-5 font-serif text-xl italic text-deep sm:text-2xl">{subtitle}</p>}
    </Reveal>
  );
}
