'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/gsap';

/**
 * Registration cursor.
 *
 * Three process channels (cyan, magenta, key) trail the pointer at different
 * rates, so fast movement pulls them out of register and they converge back
 * into a single mark the moment you stop — the site's signature gesture, tied
 * to the pointer instead of to the hero.
 *
 * Deliberate choices:
 * - The **native cursor stays visible**. Replacing it entirely costs click
 *   precision and breaks text carets, and this is a B2B site where filling in
 *   the contact form matters more than the effect.
 * - One rAF loop for all three layers, transforms only, and the loop **parks
 *   itself** once the channels have converged — no idle repaint when the
 *   pointer is still.
 * - Nothing renders on coarse pointers or under reduced motion.
 */
export default function CursorRegistration() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const layers = Array.from(
      root.querySelectorAll<HTMLElement>('[data-cursor-layer]'),
    );
    // Key channel is snappiest; cyan and magenta lag, so they smear apart.
    const ease = [0.34, 0.19, 0.13];
    const pos = layers.map(() => ({ x: -100, y: -100 }));

    let target = { x: -100, y: -100 };
    let frame = 0;
    let running = false;

    const tick = () => {
      let moving = false;

      layers.forEach((layer, i) => {
        const p = pos[i];
        p.x += (target.x - p.x) * ease[i];
        p.y += (target.y - p.y) * ease[i];
        if (Math.abs(target.x - p.x) > 0.15 || Math.abs(target.y - p.y) > 0.15) {
          moving = true;
        }
        layer.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      });

      // Park the loop once everything has caught up.
      if (moving) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
        running = false;
      }
    };

    const start = () => {
      if (!running) {
        running = true;
        frame = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: PointerEvent) => {
      target = { x: e.clientX, y: e.clientY };
      root.dataset.visible = 'true';
      start();
    };

    const onOver = (e: PointerEvent) => {
      const el = e.target as Element | null;
      const interactive = el?.closest?.(
        'a, button, [role="button"], input, select, textarea, label, summary',
      );
      root.dataset.locked = interactive ? 'true' : 'false';
    };

    const onDown = () => {
      root.dataset.pressed = 'true';
    };
    const onUp = () => {
      root.dataset.pressed = 'false';
    };
    const onLeave = () => {
      root.dataset.visible = 'false';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className="cursor-reg">
      <span data-cursor-layer className="cursor-reg__ch cursor-reg__ch--c" />
      <span data-cursor-layer className="cursor-reg__ch cursor-reg__ch--m" />
      <span data-cursor-layer className="cursor-reg__ch cursor-reg__ch--k">
        <span className="cursor-reg__v" />
        <span className="cursor-reg__h" />
      </span>
    </div>
  );
}
