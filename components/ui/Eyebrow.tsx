import { cn } from '@/lib/utils';

/**
 * Mono press-sheet annotation. Optionally prefixed with a registration index
 * (e.g. "02 —") the way a press sheet numbers its separations.
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
      {index && (
        <>
          <span className="opacity-60">{index}</span>
          <span aria-hidden="true" className="h-px w-6 bg-current opacity-40" />
        </>
      )}
      <span>{children}</span>
    </p>
  );
}
