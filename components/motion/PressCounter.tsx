'use client';

import { useEffect, useRef } from 'react';
import { loadGsap, prefersReducedMotion, whenNear } from '@/lib/gsap';

/**
 * Impression counter — the stat rolls up the way a press counts sheets.
 *
 * The final value is server-rendered, so the number is correct with JavaScript
 * disabled, under reduced motion, and before GSAP arrives. The animation only
 * ever replaces text that is already there.
 */
export default function PressCounter({
  value,
  className,
}: {
  /** e.g. "100+", "15+", "2024" — any non-digits are preserved. */
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const digits = value.match(/\d+/);
    if (!digits) return;

    const target = Number(digits[0]);
    const prefix = value.slice(0, digits.index ?? 0);
    const suffix = value.slice((digits.index ?? 0) + digits[0].length);

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    const stop = whenNear(el, () => {
      loadGsap().then(({ gsap }) => {
        if (cancelled || !ref.current) return;

        const counter = { n: 0 };
        ctx = gsap.context(() => {
          gsap.to(counter, {
            n: target,
            duration: 1.1,
            ease: 'power2.out',
            snap: { n: 1 },
            onUpdate: () => {
              if (ref.current) {
                ref.current.textContent = prefix + Math.round(counter.n) + suffix;
              }
            },
            // Guarantee the exact string we started from, digits and all.
            onComplete: () => {
              if (ref.current) ref.current.textContent = value;
            },
          });
        }, ref);
      });
    }, '0px');

    return () => {
      cancelled = true;
      stop();
      ctx?.revert();
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
