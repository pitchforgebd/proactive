'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Blend,
  ChevronDown,
  Cog,
  Disc3,
  Droplets,
  FileStack,
  FlaskConical,
  Layers,
  Package,
  Printer,
  Scroll,
  Sparkles,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { NavChild, NavItem } from '@/lib/nav';
import { cn } from '@/lib/utils';

/** Max links stacked in one column before the panel grows sideways. */
const MAX_ROWS = 6;
/** Keep the panel this far from the viewport edge. */
const EDGE_GAP = 16;

/** Icons a nav child can name (see `categoryIcon` in lib/nav.ts). Only the ones
 *  listed here are bundled. */
const ICONS: Record<string, LucideIcon> = {
  cog: Cog,
  printer: Printer,
  flask: FlaskConical,
  droplets: Droplets,
  layers: Layers,
  sparkles: Sparkles,
  scroll: Scroll,
  disc: Disc3,
  blend: Blend,
  filestack: FileStack,
  wrench: Wrench,
  package: Package,
};

/**
 * Dropdown panel. Links flow top-to-bottom, then into a new column, so adding
 * items widens the panel instead of making it taller than a laptop screen.
 * After mount it is nudged horizontally so it never overflows the viewport.
 *
 * Two looks: a compact list (About, Media), and a "mega" panel — icon + label,
 * at least two columns, "view all" footer link — used when the items carry
 * icons (Products).
 */
function DropdownPanel({
  items,
  viewAll,
  heading,
  pathname,
  onEscape,
}: {
  items: NavChild[];
  heading?: string;
  viewAll?: { label: string; href: string };
  pathname: string;
  onEscape: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const mega = items.some((c) => c.icon);
  // The footer link replaces the "All Categories" child on desktop.
  const list = mega && viewAll ? items.filter((c) => c.href !== viewAll.href) : items;

  const cols = Math.max(mega ? 2 : 1, Math.ceil(list.length / MAX_ROWS));
  const rows = Math.ceil(list.length / cols);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const place = () => {
      el.style.left = '';
      const r = el.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      let dx = 0;
      if (r.right > vw - EDGE_GAP) dx = vw - EDGE_GAP - r.right;
      if (r.left + dx < EDGE_GAP) dx = EDGE_GAP - r.left;
      if (dx) el.style.left = `${Math.round(dx)}px`;
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [cols]);

  return (
    <div
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onEscape();
      }}
      className={cn(
        'nav-pop absolute left-0 top-full z-50 mt-2 w-max max-h-[calc(100svh-96px)] max-w-[calc(100vw-2rem)] overflow-y-auto overflow-x-hidden border border-ink/10 bg-paper-2 shadow-[0_28px_60px_-28px_rgb(var(--ink-rgb)/0.55)]',
        mega ? 'rounded-2xl' : 'rounded-xl p-1.5',
      )}
    >
      {/* Registration tick marking the panel edge. */}
      <span
        aria-hidden="true"
        className="absolute left-5 top-0 z-[1] h-0.5 w-9 rounded-full bg-cyan"
      />

      {mega && (
        <div className="flex items-center justify-between gap-6 px-6 pb-1 pt-5">
          <span className="eyebrow text-[11px] text-graphite">{heading ?? 'Browse'}</span>
          <span className="eyebrow text-[11px] text-graphite/70">
            {String(list.length).padStart(2, '0')} categories
          </span>
        </div>
      )}

      <ul
        className={cn('grid', mega ? 'min-w-[560px] gap-x-2 gap-y-0.5 p-3' : 'min-w-[268px] gap-x-1')}
        style={{
          gridAutoFlow: 'column',
          gridTemplateRows: `repeat(${rows}, auto)`,
          gridAutoColumns: mega ? 'minmax(262px, auto)' : 'minmax(244px, auto)',
        }}
      >
        {list.map((child) => {
          const childActive = pathname === child.href;
          const Icon = child.icon ? (ICONS[child.icon] ?? Package) : null;
          return (
            <li key={child.href}>
              <Link
                href={child.href}
                aria-current={childActive ? 'page' : undefined}
                className={cn(
                  'group/item flex items-center whitespace-nowrap text-sm transition-colors duration-200',
                  mega
                    ? 'gap-3.5 rounded-xl px-3 py-2.5 text-[15px]'
                    : 'justify-between gap-3 rounded-lg px-3.5 py-2.5',
                  childActive ? 'font-medium text-ink' : 'text-graphite hover:text-ink',
                  mega
                    ? childActive
                      ? 'bg-cyan/10'
                      : 'hover:bg-ink/[0.04]'
                    : childActive
                      ? 'bg-magenta/5'
                      : 'hover:bg-ink/5',
                )}
              >
                {Icon && (
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ease-press',
                      childActive
                        ? 'bg-cyan text-band'
                        : 'bg-cyan/10 text-cyan group-hover/item:scale-105 group-hover/item:bg-cyan group-hover/item:text-band',
                    )}
                  >
                    <Icon aria-hidden="true" strokeWidth={1.7} className="h-5 w-5" />
                  </span>
                )}
                <span className="flex-1">{child.label}</span>
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

      {mega && viewAll && (
        <Link
          href={viewAll.href}
          className="group/all flex items-center justify-between gap-4 border-t border-ink/10 bg-ink/[0.03] px-6 py-3.5 font-display text-sm font-semibold text-ink transition-colors hover:bg-cyan/10 hover:text-cyan"
        >
          {viewAll.label}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan/15 text-cyan transition-all duration-300 ease-press group-hover/all:translate-x-1 group-hover/all:bg-cyan group-hover/all:text-band">
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
        </Link>
      )}
    </div>
  );
}

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
                    'relative block whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium transition-colors duration-200 2xl:px-3',
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
                  'relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium transition-colors duration-200 2xl:px-3',
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
                <DropdownPanel
                  items={item.children}
                  viewAll={item.viewAll}
                  heading={item.label}
                  pathname={pathname}
                  onEscape={() => setOpenIndex(null)}
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
