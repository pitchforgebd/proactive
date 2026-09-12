import Image from 'next/image';

import { cn } from '@/lib/utils';

/**
 * Site mark for header / footer / mobile drawer.
 *
 * Two images may be supplied: `src` (light theme) and `srcDark`. When both are
 * present BOTH are rendered and CSS picks one via the `dark:` variant, which is
 * mapped to `[data-theme="dark"]` in tailwind.config.ts. That matters because
 * the theme is applied by a blocking script before first paint — swapping in
 * JavaScript instead would flash the wrong mark and risk a hydration mismatch.
 *
 * With no image at all, it falls back to the coded registration wordmark;
 * title and subtitle come from Settings (`logoTitle` / `logoSubtitle`).
 */
export default function Logo({
  src,
  srcDark,
  title = 'Proactive',
  subtitle = "Trade Int'l",
  invert = false,
  className,
}: {
  /** Light-theme image. Empty/undefined → SVG wordmark fallback. */
  src?: string | null;
  /** Dark-theme image. Empty/undefined → `src` is used in both themes. */
  srcDark?: string | null;
  /** Primary wordmark line (Settings → Logo title). */
  title?: string;
  /** Secondary wordmark line (Settings → Logo subtitle). */
  subtitle?: string;
  invert?: boolean;
  className?: string;
}) {
  const lightSrc = src?.trim() || '';
  const darkSrc = srcDark?.trim() || '';
  const titleLine = title.trim() || 'Proactive';
  const subtitleLine = subtitle.trim() || "Trade Int'l";
  const alt = `${titleLine} ${subtitleLine}`.trim();

  if (lightSrc || darkSrc) {
    // Only one uploaded → use it in both themes rather than leaving a gap.
    const light = lightSrc || darkSrc;
    const dark = darkSrc || lightSrc;
    const hasPair = Boolean(lightSrc && darkSrc) && light !== dark;

    return (
      <span className={cn('relative flex h-9 w-[min(100%,180px)] items-center', className)}>
        <Image
          src={light}
          alt={alt}
          width={180}
          height={36}
          className={cn(
            'h-9 w-auto max-w-full object-contain object-left',
            hasPair && 'dark:hidden',
          )}
          priority
        />
        {hasPair && (
          <Image
            src={dark}
            alt={alt}
            width={180}
            height={36}
            className="hidden h-9 w-auto max-w-full object-contain object-left dark:block"
            priority
          />
        )}
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
