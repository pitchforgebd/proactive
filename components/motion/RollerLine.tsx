'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { loadGsap, prefersReducedMotion, whenNear } from '@/lib/gsap';

/**
 * Press roller — a cyan/magenta ink bar that travels along a hairline as you
 * scroll past it, scrubbed to scroll position rather than played on a timer.
 * Purely decorative section divider.
 */
export default function RollerLine({
  className,
  tone = 'paper',
}: {
  className?: string;
  /** Which surface it sits on — sets the hairline colour. */
  tone?: 'paper' | 'ink';
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    const stop = whenNear(el, () => {
      loadGsap().then(({ gsap }) => {
        if (cancelled || !ref.current) return;

        ctx = gsap.context(() => {
          const bar = el.querySelector('[data-roller-bar]');
          const ticks = Array.from(el.querySelectorAll('[data-roller-tick]'));
          if (!bar) return;

          gsap.fromTo(
            bar,
            { xPercent: -120 },
            {
              xPercent: 520,
              ease: 'none',
              scrollTrigger: {
                trigger: ref.current!,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
              },
            },
          );

          gsap.from(ticks, {
            scaleY: 0,
            transformOrigin: 'center',
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: { trigger: ref.current!, start: 'top 90%', once: true },
          });
        }, ref);
      });
    });

    return () => {
      cancelled = true;
      stop();
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('relative h-px w-full overflow-hidden', className)}
      style={{
        backgroundColor: tone === 'ink' ? 'var(--line)' : 'var(--line-ink)',
      }}
    >
      {/* Registration ticks along the rail. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            data-roller-tick
            className="h-[3px] w-px"
            style={{
              backgroundColor: tone === 'ink' ? 'var(--line)' : 'var(--line-ink)',
            }}
          />
        ))}
      </div>

      <span
        data-roller-bar
        className="absolute inset-y-0 left-0 block w-[18%] bg-gradient-to-r from-cyan via-magenta to-yellow"
      />
    </div>
  );
}
