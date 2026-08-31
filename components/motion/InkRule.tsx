'use client';

import { cn } from '@/lib/utils';

/**
 * Section divider — a living CMYK registration rule that breathes and feeds
 * like ink across a plate. Sits between major bands.
 */
export default function InkRule({
  className,
  tone = 'paper',
}: {
  className?: string;
  tone?: 'paper' | 'ink';
}) {
  const onInk = tone === 'ink';

  return (
    <div
      aria-hidden="true"
      className={cn('relative mx-auto h-px w-full max-w-container', className)}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-px',
          onInk ? 'bg-line' : 'bg-ink/10',
        )}
      />
      <div className="ink-rule-bar absolute left-0 top-0 h-px w-1/3" />
      <span
        className={cn(
          'ink-rule-node absolute left-[18%] top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full',
          'bg-cyan',
        )}
      />
      <span
        className={cn(
          'ink-rule-node absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full',
          'bg-magenta',
        )}
        style={{ animationDelay: '0.5s' }}
      />
      <span
        className={cn(
          'ink-rule-node absolute left-[82%] top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full',
          'bg-yellow',
        )}
        style={{ animationDelay: '1s' }}
      />
    </div>
  );
}
