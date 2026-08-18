import { cn } from '@/lib/utils';

/**
 * Placeholder block for async lists. Reserves the real dimensions so the
 * swap-in causes no layout shift.
 */
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse bg-ink/[0.06]', className)}
    />
  );
}

/** Matching skeleton for a grid of <Card /> while content resolves. */
export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-ink/10 bg-paper-2">
          <Skeleton className="aspect-[16/10] w-full" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
