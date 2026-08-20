'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'ptt-theme';

/**
 * Light / dark switch.
 *
 * The theme itself is applied by the blocking script in `app/layout.tsx` before
 * first paint, so this component never owns the initial value — it reads what
 * the document already has. Both icons are rendered and CSS picks one via the
 * `dark:` variant (mapped to `[data-theme="dark"]` in tailwind.config.ts), which
 * keeps the server and client markup identical and avoids a hydration mismatch.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

    // With no explicit choice stored, keep following the OS.
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return;
      } catch {
        /* storage blocked — fall through and follow the OS */
      }
      const next: Theme = e.matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };

    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next: Theme =
      (document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode — the choice just will not persist */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      // Null until mounted, so the server renders a neutral, still-correct label.
      aria-label={
        theme === null
          ? 'Switch colour theme'
          : theme === 'dark'
            ? 'Switch to light theme'
            : 'Switch to dark theme'
      }
      aria-pressed={theme === null ? undefined : theme === 'dark'}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-ink/15 text-ink transition-colors hover:border-magenta hover:text-magenta',
        className,
      )}
    >
      <Sun aria-hidden="true" className="h-4 w-4 dark:hidden" />
      <Moon aria-hidden="true" className="hidden h-4 w-4 dark:block" />
    </button>
  );
}
