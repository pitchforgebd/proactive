import { cn } from '@/lib/utils';

/**
 * SIGNATURE ELEMENT — the CMYK registration snap.
 *
 * The headline renders as four slightly offset process channels (C, M, Y, K)
 * that converge into perfect register, the way a press comes into alignment.
 *
 * Deliberately CSS-only and server-rendered: this text is the LCP element, so
 * it must paint before any JavaScript runs. The three colour channels are
 * aria-hidden decorative copies laid over the real, selectable heading; they
 * use `mix-blend-screen`, so once in register they disappear into the key
 * channel. Under prefers-reduced-motion they start in register and nothing
 * moves (handled in globals.css).
 *
 * Intended for dark surfaces — screen blending needs an ink ground.
 */
export default function RegistrationHero({
  children,
  /** Typography applied identically to every channel — keeps them aligned. */
  textClassName,
  className,
  as: Tag = 'h1',
}: {
  children: React.ReactNode;
  textClassName?: string;
  className?: string;
  as?: 'h1' | 'h2' | 'p';
}) {
  const channels = [
    ['reg-channel--c', 'text-cyan'],
    ['reg-channel--m', 'text-magenta'],
    ['reg-channel--y', 'text-yellow'],
  ] as const;

  return (
    <div className={cn('relative isolate', className)}>
      {channels.map(([anim, color]) => (
        <span
          key={anim}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 select-none mix-blend-screen reg-channel',
            anim,
            color,
            textClassName,
          )}
        >
          {children}
        </span>
      ))}

      {/* Key channel — the real heading text. */}
      <Tag className={cn('relative m-0', textClassName)}>{children}</Tag>
    </div>
  );
}
