'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Lazy Google Map. The iframe is not created on first paint — it mounts only
 * when the block scrolls near the viewport, or immediately if the visitor
 * clicks it first (§5.7). The placeholder reserves the full height so there is
 * no shift when the map swaps in.
 */
export default function MapEmbed({
  query,
  title = 'Office location map',
  className,
  heightClass = 'h-[320px]',
}: {
  query: string;
  title?: string;
  className?: string;
  heightClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || load || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          observer.disconnect();
        }
      },
      // Start loading a little before it is on screen, not at first paint.
      { rootMargin: '300px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [load]);

  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div
      ref={ref}
      className={cn(
        'relative w-full overflow-hidden border border-ink/10 bg-band-2',
        heightClass,
        className,
      )}
    >
      {load ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoad(true)}
          className="halftone flex h-full w-full flex-col items-center justify-center gap-2 text-onband/70 transition-colors hover:text-cyan"
        >
          <MapPin aria-hidden="true" className="h-6 w-6" />
          <span className="eyebrow">Load map</span>
          <span className="max-w-xs px-6 text-center text-xs text-onband/45">{query}</span>
        </button>
      )}
    </div>
  );
}
