'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import type { GalleryImage } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * The lightbox (and with it Framer Motion) is code-split and client-only, so
 * the gallery page's first load ships only the grid.
 */
const Lightbox = dynamic(() => import('@/components/media/Lightbox'), {
  ssr: false,
});

const ALL = 'All';

/** Masonry-style photo grid with album filtering and a click-to-open lightbox. */
export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [album, setAlbum] = useState<string>(ALL);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const albums = useMemo(() => {
    const set = new Set<string>();
    images.forEach((i) => i.album && set.add(i.album));
    return [ALL, ...Array.from(set)];
  }, [images]);

  const filtered = useMemo(
    () => (album === ALL ? images : images.filter((i) => i.album === album)),
    [images, album],
  );

  if (images.length === 0) {
    return (
      <div className="border border-dashed border-ink/20 p-10 text-center">
        <p className="eyebrow text-graphite">Gallery empty</p>
        <p className="mx-auto mt-4 max-w-md text-base text-graphite">
          Photographs are being added. Check back shortly.
        </p>
      </div>
    );
  }

  return (
    <>
      {albums.length > 2 && (
        <ul className="mb-10 flex flex-wrap gap-2" role="list">
          {albums.map((a) => (
            <li key={a}>
              <button
                type="button"
                onClick={() => {
                  setAlbum(a);
                  setOpenIndex(null);
                }}
                aria-pressed={album === a}
                className={cn(
                  'rounded-sm border px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] transition-colors',
                  album === a
                    ? 'border-ink bg-ink text-paper'
                    : 'border-ink/20 text-graphite hover:border-magenta hover:text-magenta',
                )}
              >
                {a}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* CSS columns give a masonry feel without a layout library. */}
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
        {filtered.map((img, i) => (
          <li key={img.id} className="break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group relative block w-full overflow-hidden border border-ink/10 bg-ink"
            >
              {/* Dimensions are reserved by the aspect box — no shift on load. */}
              <span
                className={cn(
                  'relative block',
                  i % 3 === 0 ? 'aspect-[4/5]' : i % 3 === 1 ? 'aspect-[4/3]' : 'aspect-square',
                )}
              >
                <Image
                  src={img.src}
                  alt={img.caption ?? 'Proactive Trade International gallery image'}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-500 ease-press group-hover:scale-[1.04]"
                />
              </span>

              {img.caption && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-4 text-left text-sm text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {img.caption}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        images={filtered}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </>
  );
}
