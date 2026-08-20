'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/gsap';

/**
 * Registration drift — the hero's decorative layers lean toward the pointer, the
 * way a press sheet sits fractionally out of register before it locks in.
 *
 * No library: it writes two CSS variables (`--px`, `--py`, each −1…1) on its
 * root and lets CSS do the transform, so the work per frame is one style write
 * inside a rAF. Children opt in with `.p-layer` and `--p-depth`.
 *
 * Skipped entirely on coarse pointers (a finger has no hover) and under
 * reduced-motion.
 */
export default function PointerParallax({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let frame = 0;
    let px = 0;
    let py = 0;

    const write = () => {
      frame = 0;
      el.style.setProperty('--px', px.toFixed(3));
      el.style.setProperty('--py', py.toFixed(3));
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      // −1 … 1 from the centre of the section.
      px = ((e.clientX - r.left) / r.width) * 2 - 1;
      py = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(write);
    };

    const onLeave = () => {
      px = 0;
      py = 0;
      if (!frame) frame = requestAnimationFrame(write);
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave, { passive: true });

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={cn('pointer-parallax', className)}>
      {children}
    </div>
  );
}
