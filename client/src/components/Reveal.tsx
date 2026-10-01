import type { ElementType, ReactNode } from 'react';
import { useInView } from '../lib/useInView';

interface Props {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  variant?: 'fade' | 'up' | 'image';
}

/** Fades content in once it scrolls into view. The "image" variant adds a slow settle-in zoom. */
export default function Reveal({ children, as: Tag = 'div', className = '', delay = 0, variant = 'up' }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>('-60px');
  const hidden =
    variant === 'up' ? 'opacity-0 translate-y-6' : variant === 'image' ? 'opacity-0 scale-[1.03]' : 'opacity-0';
  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
        inView ? 'translate-y-0 scale-100 opacity-100' : hidden
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
