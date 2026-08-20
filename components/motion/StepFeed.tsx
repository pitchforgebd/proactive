'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { loadGsap, prefersReducedMotion, whenNear } from '@/lib/gsap';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Sheet feed — steps enter one after another from the left while a guide rail
 * draws down beside them, the way sheets travel through a press.
 *
 * A GSAP timeline rather than a stagger, because the rail and the rows have to
 * stay in step with each other.
 */
export default function StepFeed({
  children,
  className,
  selector = '[data-feed-item]',
}: {
  children: React.ReactNode;
  className?: string;
  selector?: string;
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
          const items = Array.from(el.querySelectorAll(selector));
          const rail = Array.from(el.querySelectorAll('[data-feed-rail]'));
          disarm();
          if (!items.length) return;

          const tl = gsap.timeline({
            scrollTrigger: { trigger: ref.current!, start: 'top 82%', once: true },
          });

          tl.from(rail, {
            scaleY: 0,
            transformOrigin: 'top center',
            duration: 0.55,
            ease: 'power2.out',
          }).from(
            items,
            {
              x: -18,
              autoAlpha: 0,
              duration: 0.5,
              ease: 'power3.out',
              stagger: 0.13,
            },
            0.15,
          );
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
  }, [selector]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
