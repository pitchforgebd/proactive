'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, Minus, Plus, X } from 'lucide-react';
import type { NavItem } from '@/lib/nav';
import Logo from '@/components/layout/Logo';
import { cn } from '@/lib/utils';

/**
 * Mobile navigation drawer. CSS transitions only — no animation library on the
 * critical path. Locks body scroll, closes on Escape and on route change, and
 * restores focus to the trigger.
 */
export default function MobileDrawer({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-magenta xl:hidden"
      >
        <Menu aria-hidden="true" className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-[70] bg-ink/60 transition-opacity duration-300 xl:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Panel */}
      <div
        id="mobile-nav"
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={cn(
          'fixed inset-y-0 right-0 z-[80] flex w-[min(88vw,380px)] flex-col bg-paper-2 transition-transform duration-300 ease-press xl:hidden',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <Logo />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}
            aria-label="Close menu"
            className="inline-flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-magenta"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <ul className="divide-y divide-ink/10">
            {items.map((item) => {
              const isOpen = expanded === item.label;
              return (
                <li key={item.href} className="py-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      className="flex-1 py-3 text-base text-ink transition-colors hover:text-magenta"
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : item.label)}
                        aria-expanded={isOpen}
                        aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${item.label}`}
                        className="inline-flex h-9 w-9 items-center justify-center text-graphite transition-colors hover:text-cyan"
                      >
                        {isOpen ? (
                          <Minus aria-hidden="true" className="h-4 w-4" />
                        ) : (
                          <Plus aria-hidden="true" className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {item.children && isOpen && (
                    <ul className="mb-2 space-y-1 border-l border-cyan/40 pl-4">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block py-2 text-sm text-graphite transition-colors hover:text-magenta"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-ink/10 p-5">
          <Link
            href="/contact"
            className="flex w-full items-center justify-center rounded-sm bg-cyan px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-magenta hover:text-white"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </>
  );
}
