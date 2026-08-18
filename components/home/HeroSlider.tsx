'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Background image rotation behind the hero statement.
 *
 * LCP discipline: only the first slide is rendered on the server, with
 * `priority`, so it is the single image the browser fetches during first paint.
 * The remaining slides mount after hydration and load lazily — they can never
 * compete with the LCP image for bandwidth. Rotation stops entirely under
 * prefers-reduced-motion.
 */
export default function HeroSlider({
  slides,
  intervalMs = 6000,
}: {
  slides: { src: string; alt: string }[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [mountRest, setMountRest] = useState(false);

  useEffect(() => {
    if (slides.length < 2) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    // Defer the extra slides until the page is idle — never during first paint.
    const idle = window.setTimeout(() => setMountRest(true), 1200);
    return () => window.clearTimeout(idle);
  }, [slides.length]);

  useEffect(() => {
    if (!mountRest || slides.length < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [mountRest, slides.length, intervalMs]);

  const visible = mountRest ? slides : slides.slice(0, 1);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-ink">
      {visible.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt=""
          fill
          sizes="100vw"
          priority={i === 0}
          loading={i === 0 ? undefined : 'lazy'}
          quality={72}
          className={cn(
            'object-cover transition-opacity duration-1000 ease-press',
            i === index ? 'opacity-100' : 'opacity-0',
          )}
        />
      ))}

      {/* Ink scrim + halftone so the headline holds contrast on any slide. */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/45" />
      <div className="absolute inset-0 halftone opacity-40" />

      {/* Slide indicators — decorative, the slider carries no content. */}
      {mountRest && slides.length > 1 && (
        <div className="absolute bottom-8 right-6 flex gap-1.5 md:right-10">
          {slides.map((s, i) => (
            <span
              key={s.src}
              className={cn(
                'h-px w-8 transition-colors duration-500',
                i === index ? 'bg-cyan' : 'bg-white/25',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
