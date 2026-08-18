'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { NavItem } from '@/lib/nav';
import { cn } from '@/lib/utils';

/**
 * Desktop navigation with dropdowns.
 *
 * Keyboard support is the point here: each parent is a real <button> with
 * aria-expanded, Escape closes and returns focus, and the panel is reachable by
 * Tab. Hover opens it for mouse users without trapping keyboard users.
 */
export default function Nav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on route change.
  useEffect(() => {
    setOpenIndex(null);
  }, [pathname]);

  // Close on outside click.
  useEffect(() => {
    if (openIndex === null) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openIndex]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  // Small grace period so the pointer can cross the gap to the panel.
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenIndex(null), 120);
  };

  return (
    <nav ref={navRef} aria-label="Primary" className="hidden xl:block">
      <ul className="flex items-center gap-0.5">
        {items.map((item, i) => {
          const active = isActive(item.href);
          const open = openIndex === i;

          if (!item.children) {
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative block px-3 py-2 text-sm transition-colors hover:text-magenta',
                    active ? 'text-ink' : 'text-graphite',
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-3 bottom-0.5 h-px bg-magenta transition-transform duration-300 ease-press',
                      active ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />
                </Link>
              </li>
            );
          }

          return (
            <li
              key={item.href}
              className="relative"
              onMouseEnter={() => {
                cancelClose();
                setOpenIndex(i);
              }}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                aria-expanded={open}
                aria-haspopup="true"
                onClick={() => setOpenIndex(open ? null : i)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setOpenIndex(null);
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setOpenIndex(i);
                  }
                }}
                className={cn(
                  'relative flex items-center gap-1 px-3 py-2 text-sm transition-colors hover:text-magenta',
                  active ? 'text-ink' : 'text-graphite',
                )}
              >
                {item.label}
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-200',
                    open && 'rotate-180',
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-3 bottom-0.5 h-px bg-magenta transition-transform duration-300 ease-press',
                    active ? 'scale-x-100' : 'scale-x-0',
                  )}
                />
              </button>

              {open && (
                <div
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setOpenIndex(null);
                  }}
                  className="absolute left-0 top-full z-50 min-w-[260px] border border-ink/10 bg-paper-2 py-2 shadow-[0_18px_40px_-24px_rgba(14,17,22,.45)]"
                >
                  {/* Registration tick marking the panel edge. */}
                  <span
                    aria-hidden="true"
                    className="absolute left-3 top-0 h-px w-8 bg-cyan"
                  />
                  <ul>
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={cn(
                            'block px-4 py-2.5 text-sm transition-colors hover:bg-paper hover:text-magenta',
                            pathname === child.href ? 'text-ink' : 'text-graphite',
                          )}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
