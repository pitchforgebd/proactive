'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryImage } from '@/lib/types';

/**
 * Gallery lightbox.
 *
 * This is the one place Framer Motion earns its weight: it is loaded through a
 * `dynamic(..., { ssr: false })` import from the gallery page, so the animation
 * runtime never reaches any other route and never blocks first paint.
 *
 * Keyboard: Escape closes, arrows page. Body scroll is locked while open.
 */
export default function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: GalleryImage[];
  /** null = closed. */
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const open = index !== null;

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange((index + delta + images.length) % images.length);
    },
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, step]);

  const current = index !== null ? images[index] : null;

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label={current.caption ?? 'Gallery image'}
          className="fixed inset-0 z-[90] flex flex-col bg-ink/95 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-4">
            <p className="eyebrow text-paper/50">
              {String((index ?? 0) + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close gallery"
              className="inline-flex h-10 w-10 items-center justify-center text-paper/70 transition-colors hover:text-cyan"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          {/* Stage */}
          <div className="relative flex flex-1 items-center justify-center px-4 pb-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              aria-label="Previous image"
              className="absolute left-2 z-10 inline-flex h-11 w-11 items-center justify-center border border-line text-paper/70 transition-colors hover:border-cyan hover:text-cyan md:left-6"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>

            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-full max-h-[76vh] w-full max-w-5xl"
            >
              <Image
                src={current.src}
                alt={current.caption ?? ''}
                fill
                sizes="(min-width: 1024px) 70vw, 92vw"
                className="object-contain"
              />
            </motion.div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              aria-label="Next image"
              className="absolute right-2 z-10 inline-flex h-11 w-11 items-center justify-center border border-line text-paper/70 transition-colors hover:border-cyan hover:text-cyan md:right-6"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          {/* Caption */}
          {current.caption && (
            <p className="px-6 pb-8 text-center text-sm text-paper/60">
              {current.caption}
              {current.album && (
                <span className="ml-3 font-mono text-xs uppercase tracking-[0.16em] text-paper/35">
                  {current.album}
                </span>
              )}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
