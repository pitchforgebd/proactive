import { cn } from '@/lib/utils';

/**
 * Mono caption label. Optional registration index (e.g. "02") sits beside the
 * title with no dash/hyphen separator.
 */
export default function Eyebrow({
  children,
  index,
  tone = 'cyan',
  className,
}: {
  children: React.ReactNode;
  index?: string;
  tone?: 'cyan' | 'magenta' | 'muted';
  className?: string;
}) {
  const color =
    tone === 'magenta'
      ? 'text-magenta'
      : tone === 'muted'
        ? 'text-graphite'
        : 'text-cyan';

  return (
    <p className={cn('eyebrow flex items-center gap-2', color, className)}>
      {index && <span className="opacity-60">{index}</span>}
      <span>{children}</span>
    </p>
  );
}
