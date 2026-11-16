'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** Cross-fade length — keep in sync with `duration-[1400ms]` below. */
const FADE_MS = 1400;

/**
 * Full-bleed hero slider: cross-fade between photos, each one slowly zooming in
 * (Ken Burns) while it is on screen.
 *
 * LCP discipline: only the first slide is rendered on the server, with
 * `priority`, so it is the single image the browser fetches during first paint.
 * The remaining slides mount after hydration and load lazily — they can never
 * compete with the LCP image for bandwidth. Rotation and zoom stop entirely
 * under prefers-reduced-motion.
 *
 * Overlay: ONE neutral colour (`--scrim-rgb`), flat-to-slightly-weighted on the
 * left for headline contrast — no blue wash, no two-colour gradient.
 */
export default function HeroSlider({
  slides,
  intervalMs = 6000,
}: {
  slides: { src: string; alt: string }[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [mountRest, setMountRest] = useState(false);
  const indexRef = useRef(0);

  const goTo = useCallback((next: number) => {
    if (next === indexRef.current) return;
    setPrev(indexRef.current);
    indexRef.current = next;
    setIndex(next);
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    // Defer the extra slides until the page is idle — never during first paint.
    const idle = window.setTimeout(() => setMountRest(true), 1200);
    return () => window.clearTimeout(idle);
  }, [slides.length]);

  // Restarts whenever `index` changes, so a manual dot click resets the timer.
  useEffect(() => {
    if (!mountRest || slides.length < 2) return;
    const id = window.setTimeout(
      () => goTo((indexRef.current + 1) % slides.length),
      intervalMs,
    );
    return () => window.clearTimeout(id);
  }, [mountRest, slides.length, intervalMs, index, goTo]);

  const visible = mountRest ? slides : slides.slice(0, 1);
  const zoomMs = intervalMs + FADE_MS + 400;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[rgb(var(--scrim-rgb))]">
      {visible.map((slide, i) => {
        const active = i === index;
        // The slide being faded out keeps its zoom running so it doesn't
        // snap back to scale(1) while it is still visible.
        const zooming = active || i === prev;
        return (
          <div
            key={slide.src}
            aria-hidden="true"
            className={cn(
              'absolute inset-0 transition-opacity duration-[1400ms] ease-in-out',
              active ? 'opacity-100' : 'opacity-0',
            )}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              sizes="100vw"
              priority={i === 0}
              loading={i === 0 ? undefined : 'lazy'}
              quality={75}
              style={zooming ? { animationDuration: `${zoomMs}ms` } : undefined}
              className={cn(
                'object-cover object-center',
                zooming && 'hero-kenburns',
              )}
            />
          </div>
        );
      })}

      {/* Single-colour scrim: same neutral at two strengths, never two hues. */}
      <div aria-hidden="true" className="hero-scrim absolute inset-0" />

      {/* Slide indicators — real buttons so keyboard users can switch slides. */}
      {mountRest && slides.length > 1 && (
        <div
          role="group"
          aria-label="Hero slides"
          className="absolute bottom-4 left-1/2 z-[3] flex -translate-x-1/2 gap-1 sm:bottom-6 md:bottom-8"
        >
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              aria-label={`Show slide ${i + 1} of ${slides.length}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => goTo(i)}
              className="group flex h-6 items-center px-1"
            >
              <span
                className={cn(
                  'block h-[3px] rounded-full transition-all duration-500',
                  i === index
                    ? 'w-8 bg-white sm:w-10'
                    : 'w-4 bg-white/40 group-hover:bg-white/70 sm:w-5',
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
