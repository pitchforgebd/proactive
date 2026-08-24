import type { Metadata } from 'next';

/**
 * A missing record still renders (as the 404 page) with HTTP 200 — Next 14
 * answers notFound() that way on an ISR route generated on demand. The status
 * cannot be corrected without `dynamicParams = false`, which would make
 * dashboard-added slugs unreachable until the next deploy. So the next best
 * thing: tell crawlers not to index it, or a deleted product lingers in search
 * results as a live page.
 */
export function notFoundMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}
