import { cn } from '@/lib/utils';

/**
 * Registration crop marks at the four corners of a section — the quiet half of
 * the print identity. Pure CSS, no JS, decorative only.
 */
export default function CropMarks({
  tone = 'dark',
  className,
}: {
  /** 'dark' = marks drawn in ink (on paper); 'light' = drawn in paper (on ink). */
  tone?: 'dark' | 'light';
  className?: string;
}) {
  const color = tone === 'light' ? 'bg-white/25' : 'bg-ink/20';

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute -inset-x-2 -inset-y-6 hidden md:block',
        className,
      )}
    >
      {(
        [
          ['left-0 top-0', 'left-0 top-0'],
          ['right-0 top-0', 'right-0 top-0'],
          ['left-0 bottom-0', 'left-0 bottom-0'],
          ['right-0 bottom-0', 'right-0 bottom-0'],
        ] as const
      ).map(([hPos, vPos], i) => (
        <span key={i}>
          <span className={cn('absolute h-px w-6', color, hPos)} />
          <span className={cn('absolute h-6 w-px', color, vPos)} />
        </span>
      ))}
    </div>
  );
}
