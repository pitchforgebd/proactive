'use client';

import { cn } from '@/lib/utils';

/**
 * Futuristic press-room atmosphere for dark bands.
 *
 * CMYK registration rings slowly orbit (like a press coming into register),
 * a thin process-colour scan line sweeps the sheet, and faint ink dots drift.
 * Purely decorative — CSS-driven, no JS loop. Reduced motion is handled globally.
 */
export default function PressAtmosphere({
  className,
  intensity = 'normal',
}: {
  className?: string;
  /** `soft` for busy heroes; `normal` for CTA / dark bands. */
  intensity?: 'soft' | 'normal';
}) {
  const soft = intensity === 'soft';

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      {/* Orbiting registration target — kept quiet, not a focal element. */}
      <div
        className={cn(
          'press-orbit absolute -right-[12%] top-1/2 hidden aspect-square w-[min(72vw,560px)] -translate-y-1/2 lg:block',
          soft ? 'opacity-[0.18]' : 'opacity-[0.28]',
        )}
      >
        <svg viewBox="0 0 400 400" className="h-full w-full">
          <circle
            cx="200"
            cy="200"
            r="118"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="1"
            className="press-orbit__ring press-orbit__ring--c"
          />
          <circle
            cx="200"
            cy="200"
            r="148"
            fill="none"
            stroke="var(--magenta)"
            strokeWidth="0.8"
            opacity="0.85"
            className="press-orbit__ring press-orbit__ring--m"
          />
          <circle
            cx="200"
            cy="200"
            r="178"
            fill="none"
            stroke="var(--yellow)"
            strokeWidth="0.6"
            opacity="0.45"
            className="press-orbit__ring press-orbit__ring--y"
          />
          <g stroke="var(--onband)" strokeWidth="0.6" opacity="0.35">
            <path d="M200 52v296M52 200h296" />
            <circle cx="200" cy="200" r="4" fill="var(--onband)" stroke="none" opacity="0.5" />
          </g>
          {/* Registration ticks */}
          <g strokeWidth="1.2">
            <path d="M200 28v16" stroke="var(--cyan)" className="press-pulse" />
            <path d="M372 200h-16" stroke="var(--magenta)" className="press-pulse" style={{ animationDelay: '0.4s' }} />
            <path d="M200 372v-16" stroke="var(--yellow)" className="press-pulse" style={{ animationDelay: '0.8s' }} />
            <path d="M28 200h16" stroke="var(--onband)" opacity="0.5" className="press-pulse" style={{ animationDelay: '1.2s' }} />
          </g>
        </svg>
      </div>

      {/* Press scan — sheet of light travelling like a print head */}
      <div className={cn('press-scan', soft && 'opacity-50')} />

      {/* Drifting process dots (halftone “ink in air”) — thinned from six to three. */}
      <span className="press-dot press-dot--c" style={{ top: '18%', left: '12%' }} />
      <span className="press-dot press-dot--m" style={{ top: '62%', left: '8%', animationDelay: '1.6s' }} />
      <span className="press-dot press-dot--c" style={{ top: '74%', left: '58%', animationDelay: '0.9s' }} />
    </div>
  );
}
