import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Eyebrow from '@/components/ui/Eyebrow';
import { cn } from '@/lib/utils';

/**
 * Standard section header: mono eyebrow, display title, optional lede and a
 * "view more" link aligned to the right on wide screens.
 */
export default function SectionHeading({
  eyebrow,
  index,
  title,
  lede,
  link,
  invert = false,
  align = 'left',
  className,
}: {
  eyebrow?: string;
  index?: string;
  title: React.ReactNode;
  lede?: string;
  link?: { href: string; label: string };
  invert?: boolean;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'md:flex-col md:items-center md:text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'text-center')}>
        {eyebrow && (
          <Eyebrow
            index={index}
            tone={invert ? 'cyan' : 'magenta'}
            className={cn(align === 'center' && 'justify-center')}
          >
            {eyebrow}
          </Eyebrow>
        )}
        <h2
          className={cn(
            'mt-4 text-xl font-bold leading-tight md:text-2xl',
            invert ? 'text-onband' : 'text-ink',
          )}
        >
          {title}
        </h2>
        {lede && (
          <p
            className={cn(
              'mt-4 text-base leading-relaxed',
              invert ? 'text-onband/65' : 'text-graphite',
            )}
          >
            {lede}
          </p>
        )}
      </div>

      {link && (
        <Link
          href={link.href}
          className={cn(
            'group inline-flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] transition-colors',
            invert ? 'text-onband/70 hover:text-cyan' : 'text-graphite hover:text-magenta',
          )}
        >
          {link.label}
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
          />
        </Link>
      )}
    </div>
  );
}
