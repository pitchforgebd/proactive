'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * "Ink spread" scroll reveal — fades, lifts and un-blurs once when the element
 * enters the viewport, then disconnects.
 *
 * Deliberately a bare IntersectionObserver rather than a Framer Motion
 * `whileInView`: this wrapper appears dozens of times per page, and shipping an
 * animation runtime for a one-shot CSS transition is exactly the bundle bloat
 * §5 rules out. Reduced motion is handled globally in globals.css.
 */
export default function RevealOnView({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  /** Stagger in ms — keep under ~240 so nothing feels slow. */
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'article';
}) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer support (or already past): just show it.
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-revealed={revealed}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn('ink-reveal', className)}
    >
      {children}
    </Tag>
  );
}
