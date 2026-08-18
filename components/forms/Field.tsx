import { cn } from '@/lib/utils';

/**
 * Shared field chrome for both forms: mono label, error text wired to the
 * control by id, and a consistent focus/invalid treatment.
 */
export function Field({
  id,
  label,
  error,
  required,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        htmlFor={id}
        className="font-mono text-xs uppercase tracking-[0.14em] text-graphite"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-magenta">
            *
          </span>
        )}
      </label>

      {children}

      {hint && !error && <p className="text-xs text-graphite/80">{hint}</p>}

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-magenta">
          {error}
        </p>
      )}
    </div>
  );
}

/** One shared input skin so every control in the site matches. */
export const controlClass =
  'w-full rounded-sm border border-ink/20 bg-paper-2 px-4 py-3 text-base text-ink transition-colors placeholder:text-graphite/50 focus:border-cyan focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-magenta';
