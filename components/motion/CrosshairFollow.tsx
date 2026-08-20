'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/gsap';

/**
 * A registration crosshair that tracks the pointer inside the element, plus a
 * faint halftone shimmer under it — the "line up the sheet" gesture, on hover.
 *
 * Writes `--mx` / `--my` (px, element-relative) and lets CSS paint. No library,
 * one style write per frame, and nothing at all on touch or reduced motion.
 */
export default function CrosshairFollow({
  children,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'article';
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const write = () => {
      frame = 0;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!frame) frame = requestAnimationFrame(write);
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      el.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <Tag ref={ref as never} className={cn('crosshair-follow', className)}>
      {children}
      <span aria-hidden="true" className="crosshair-follow__mark">
        <span className="crosshair-follow__v" />
        <span className="crosshair-follow__h" />
        <span className="crosshair-follow__ring" />
      </span>
    </Tag>
  );
}
