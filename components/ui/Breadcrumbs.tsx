import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  href?: string;
}

/** Breadcrumb trail. Emits BreadcrumbList JSON-LD alongside the visible nav. */
export default function Breadcrumbs({
  items,
  invert = false,
  className,
}: {
  items: Crumb[];
  invert?: boolean;
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'eyebrow flex flex-wrap items-center gap-x-2 gap-y-1',
        invert ? 'text-paper/55' : 'text-graphite',
        className,
      )}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className={cn(
                  'transition-colors',
                  invert ? 'hover:text-cyan' : 'hover:text-magenta',
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? 'page' : undefined}
                className={invert ? 'text-paper' : 'text-ink'}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <span aria-hidden="true" className="opacity-40">
                /
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
