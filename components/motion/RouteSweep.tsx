'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Print-sweep wipe on route change: a thin cyan→magenta roller line runs across
 * the top of the viewport for ~280ms after navigation commits.
 *
 * It is `pointer-events-none` and fixed, so it never blocks navigation or
 * input — the page is already interactive while it plays. Disabled entirely
 * under prefers-reduced-motion (the global rule collapses its duration).
 */
export default function RouteSweep() {
  const pathname = usePathname();
  const [key, setKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Skip the sweep on first paint — it should mark transitions, not arrival.
    if (!mounted) {
      setMounted(true);
      return;
    }
    setKey((k) => k + 1);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden"
    >
      {key > 0 && (
        <span
          key={key}
          className="block h-full w-full origin-left"
          style={{
            background: 'linear-gradient(90deg, var(--cyan), var(--magenta))',
            animation: 'print-sweep 280ms cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
        />
      )}
    </div>
  );
}
