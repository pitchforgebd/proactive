'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Product image gallery: one large plate plus a thumbnail strip.
 *
 * Every frame is a fixed aspect box, so switching images cannot shift layout.
 * Only the first image is eager — the rest load lazily as the visitor reaches
 * for them.
 */
export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden border border-ink/10 bg-band">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === active ? name : ''}
            fill
            priority={i === 0}
            loading={i === 0 ? undefined : 'lazy'}
            sizes="(min-width: 1024px) 52vw, 92vw"
            className={cn(
              'object-cover transition-opacity duration-300',
              i === active ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}

        {/* Registration ticks framing the plate. */}
        <span aria-hidden="true" className="pointer-events-none absolute left-4 top-4 h-4 w-px bg-cyan" />
        <span aria-hidden="true" className="pointer-events-none absolute left-4 top-4 h-px w-4 bg-cyan" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-4 right-4 h-4 w-px bg-magenta" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-4 right-4 h-px w-4 bg-magenta" />
      </div>

      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-pressed={i === active}
                className={cn(
                  'relative block aspect-[4/3] w-full overflow-hidden border transition-colors',
                  i === active
                    ? 'border-cyan'
                    : 'border-ink/10 hover:border-ink/35',
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 13vw, 23vw"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
