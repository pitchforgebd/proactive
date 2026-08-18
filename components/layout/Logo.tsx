import { cn } from '@/lib/utils';

/**
 * Wordmark with a CMYK registration target as the mark. Inline SVG so it costs
 * no request and inherits colour from the surface it sits on.
 */
export default function Logo({
  invert = false,
  className,
}: {
  invert?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 32 32"
        width="30"
        height="30"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Registration target: cyan and magenta rings slightly out of register. */}
        <circle cx="14.5" cy="16" r="9" fill="none" stroke="var(--cyan)" strokeWidth="2" />
        <circle cx="17.5" cy="16" r="9" fill="none" stroke="var(--magenta)" strokeWidth="2" opacity="0.9" />
        <path
          d="M16 3v26M3 16h26"
          stroke={invert ? 'rgba(244,246,248,.75)' : 'rgba(14,17,22,.55)'}
          strokeWidth="1"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-[15px] font-extrabold uppercase tracking-[0.02em]',
            invert ? 'text-paper' : 'text-ink',
          )}
        >
          Proactive
        </span>
        <span
          className={cn(
            'font-mono text-[9px] uppercase tracking-[0.28em]',
            invert ? 'text-paper/55' : 'text-graphite',
          )}
        >
          Trade Int&apos;l
        </span>
      </span>
    </span>
  );
}
