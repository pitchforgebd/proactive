'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
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

  const matches = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // A parent also counts as active when one of its children is the current
  // page — a dropdown may list a route that lives outside the parent's own
  // path (Vision & Mission sits under About Us but at /vision-mission).
  const isActive = (item: NavItem) =>
    matches(item.href) || (item.children?.some((c) => matches(c.href)) ?? false);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  // Small grace period so the pointer can cross the gap to the panel.
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenIndex(null), 120);
  };

  return (
    <nav ref={navRef} aria-label="Primary" className="hidden shrink-0 xl:block">
      <ul className="flex items-center gap-1">
        {items.map((item, i) => {
          const active = isActive(item);
          const open = openIndex === i;

          if (!item.children) {
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                    active
                      ? 'bg-magenta/5 text-ink'
                      : 'text-graphite hover:bg-ink/5 hover:text-ink',
                  )}
                >
                  {item.label}
                  {/* Short registration bar, centred under the label. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-3 bottom-1 mx-auto h-0.5 w-4 rounded-full bg-cyan transition-all duration-300 ease-press',
                      active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0',
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
                  'relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                  active || open
                    ? 'bg-magenta/5 text-ink'
                    : 'text-graphite hover:bg-ink/5 hover:text-ink',
                )}
              >
                {item.label}
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-200',
                    open ? 'rotate-180 text-cyan' : 'text-graphite/70',
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-3 bottom-1 mx-auto h-0.5 w-4 rounded-full bg-cyan transition-all duration-300 ease-press',
                    active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0',
                  )}
                />
              </button>

              {open && (
                <div
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setOpenIndex(null);
                  }}
                  className="absolute left-0 top-full z-50 mt-1.5 min-w-[268px] overflow-hidden rounded-xl border border-ink/10 bg-paper-2 p-1.5 shadow-[0_20px_44px_-26px_rgb(var(--ink-rgb)/0.5)]"
                >
                  {/* Registration tick marking the panel edge. */}
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-0 h-0.5 w-9 rounded-full bg-cyan"
                  />
                  <ul>
                    {item.children.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              'group/item flex items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm transition-colors duration-200',
                              childActive
                                ? 'bg-magenta/5 font-medium text-ink'
                                : 'text-graphite hover:bg-ink/5 hover:text-ink',
                            )}
                          >
                            {child.label}
                            <ArrowRight
                              aria-hidden="true"
                              className={cn(
                                'h-3.5 w-3.5 shrink-0 text-cyan transition-all duration-300 ease-press',
                                childActive
                                  ? 'translate-x-0 opacity-100'
                                  : '-translate-x-1 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100',
                              )}
                            />
                          </Link>
                        </li>
                      );
                    })}
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
