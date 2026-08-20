'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { loadGsap, prefersReducedMotion, whenNear } from '@/lib/gsap';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Ink-spread stagger, driven by GSAP ScrollTrigger.
 *
 * Items are armed (hidden) in a layout effect so there is no flash before the
 * animation runs, then released in sequence as the block scrolls in. If GSAP
 * fails to load, a failsafe disarms them after 2.5s — content never stays
 * hidden because of a network problem.
 */
export default function InkStagger({
  children,
  className,
  selector = '[data-ink-item]',
  stagger = 0.075,
  y = 28,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  /** Which descendants to animate. */
  selector?: string;
  stagger?: number;
  y?: number;
  as?: 'div' | 'ul' | 'ol' | 'section';
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    el.dataset.stagger = 'armed';
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const disarm = () => {
      if (ref.current) delete ref.current.dataset.stagger;
    };
    const failsafe = window.setTimeout(disarm, 2500);

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    const stop = whenNear(el, () => {
      loadGsap().then(({ gsap }) => {
        if (cancelled || !ref.current) return;
        window.clearTimeout(failsafe);

        ctx = gsap.context(() => {
          // Query off the element, not ctx.selector: a silent empty match there
          // turns the whole tween into a no-op that still looks fine on screen.
          const items = Array.from(el.querySelectorAll(selector));
          disarm();
          if (!items.length) return;

          gsap.from(items, {
            y,
            autoAlpha: 0,
            filter: 'blur(7px)',
            duration: 0.7,
            ease: 'power3.out',
            stagger,
            scrollTrigger: { trigger: ref.current!, start: 'top 88%', once: true },
          });
        }, ref);
      });
    });

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      stop();
      ctx?.revert();
      disarm();
    };
  }, [selector, stagger, y]);

  return (
    <Tag ref={ref as never} className={cn(className)}>
      {children}
    </Tag>
  );
}
