import Image from 'next/image';

import { cn } from '@/lib/utils';

/**
 * Site mark for header / footer / mobile drawer.
 *
 * When `src` is set (from Settings.logo), render the uploaded/public image.
 * Otherwise fall back to the coded CMYK registration wordmark — title and
 * subtitle come from Settings (`logoTitle` / `logoSubtitle`).
 */
export default function Logo({
  src,
  title = 'Proactive',
  subtitle = "Trade Int'l",
  invert = false,
  className,
}: {
  /** Empty/undefined → SVG wordmark fallback. */
  src?: string | null;
  /** Primary wordmark line (Settings → Logo title). */
  title?: string;
  /** Secondary wordmark line (Settings → Logo subtitle). */
  subtitle?: string;
  invert?: boolean;
  className?: string;
}) {
  const imageSrc = src?.trim() || '';
  const titleLine = title.trim() || 'Proactive';
  const subtitleLine = subtitle.trim() || "Trade Int'l";

  if (imageSrc) {
    return (
      <span className={cn('relative flex h-9 w-[min(100%,180px)] items-center', className)}>
        <Image
          src={imageSrc}
          alt={`${titleLine} ${subtitleLine}`.trim()}
          width={180}
          height={36}
          className="h-9 w-auto max-w-full object-contain object-left"
          priority
        />
      </span>
    );
  }

  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 32 32"
        width="30"
        height="30"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="14.5" cy="16" r="9" fill="none" stroke="var(--cyan)" strokeWidth="2" />
        <circle
          cx="17.5"
          cy="16"
          r="9"
          fill="none"
          stroke="var(--magenta)"
          strokeWidth="2"
          opacity="0.9"
        />
        <path
          d="M16 3v26M3 16h26"
          stroke={invert ? 'rgba(244,246,248,.75)' : 'var(--ink)'}
          strokeOpacity={invert ? 1 : 0.55}
          strokeWidth="1"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-[15px] font-extrabold uppercase',
            invert ? 'text-onband' : 'text-ink',
          )}
        >
          {titleLine}
        </span>
        <span
          className={cn(
            'font-mono text-[9px] uppercase',
            invert ? 'text-onband/55' : 'text-graphite',
          )}
        >
          {subtitleLine}
        </span>
      </span>
    </span>
  );
}
