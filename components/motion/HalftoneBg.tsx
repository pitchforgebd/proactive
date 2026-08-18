import { cn } from '@/lib/utils';

/**
 * Halftone dot field with an optional registration grid, for the background of
 * dark sections. Decorative, CSS-only, zero JS.
 */
export default function HalftoneBg({
  grid = false,
  fade = true,
  size = 7,
  className,
}: {
  /** Overlay the 72px registration grid. */
  grid?: boolean;
  /** Fade the field out toward the bottom so content stays readable. */
  fade?: boolean;
  /** Dot pitch in px. */
  size?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <div
        className="absolute inset-0 halftone"
        style={
          {
            '--halftone-size': `${size}px`,
            maskImage: fade
              ? 'linear-gradient(to bottom, black, black 55%, transparent)'
              : undefined,
            WebkitMaskImage: fade
              ? 'linear-gradient(to bottom, black, black 55%, transparent)'
              : undefined,
          } as React.CSSProperties
        }
      />
      {grid && <div className="absolute inset-0 reg-grid opacity-70" />}
    </div>
  );
}
