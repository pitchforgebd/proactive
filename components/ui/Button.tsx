import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'onInk';

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: 'bg-cyan text-band hover:bg-magenta hover:text-white',
  secondary: 'border border-ink/25 text-ink hover:border-magenta hover:text-magenta',
  ghost: 'text-ink hover:text-magenta',
  onInk: 'border border-white/25 text-onband hover:border-cyan hover:text-cyan',
};

interface CommonProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

/** Internal/external link styled as a button. */
export function ButtonLink({
  href,
  children,
  variant = 'primary',
  className,
  external = false,
  ...rest
}: CommonProps & {
  href: string;
  external?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>) {
  const classes = cn(base, variants[variant], className);

  if (external) {
    return (
      <a href={href} className={classes} rel="noopener noreferrer" target="_blank" {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

/** Real button — used by forms. */
export default function Button({
  children,
  variant = 'primary',
  className,
  type = 'button',
  ...rest
}: CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>) {
  return (
    <button type={type} className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}
