'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Fixed "back to top" button — bottom-right, appears once the page has been
 * scrolled a screen's worth. Sits above WhatsAppFloat so the two never
 * overlap (see app/(site)/layout.tsx).
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className="fixed bottom-24 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-cyan text-band shadow-[0_12px_28px_-8px_rgba(18,169,230,0.55)] transition-all duration-300 ease-press hover:bg-magenta hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:bottom-28 sm:right-6"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <ArrowUp aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}
