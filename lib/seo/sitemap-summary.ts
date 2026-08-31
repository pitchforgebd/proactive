/**
 * Admin-facing summary helpers for the live sitemap (no DB).
 */
import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/utils';

export interface SitemapUrlBreakdown {
  cmsPages: number;
  categories: number;
  products: number;
  newsArticles: number;
  hubs: number;
  other: number;
  total: number;
  /** Newest lastModified among entries, ISO string, or null. */
  newestLastModified: string | null;
}

function pathnameOf(url: string): string {
  try {
    return new URL(url).pathname.replace(/\/$/, '') || '/';
  } catch {
    return url;
  }
}

export function summarizeSitemapEntries(
  entries: MetadataRoute.Sitemap,
): SitemapUrlBreakdown {
  let cmsPages = 0;
  let categories = 0;
  let products = 0;
  let newsArticles = 0;
  let hubs = 0;
  let other = 0;
  let newest: Date | null = null;

  const hubsSet = new Set([
    '/media/news',
    '/media/photo-gallery',
    '/media/video-gallery',
  ]);

  for (const e of entries) {
    const path = pathnameOf(e.url);
    if (e.lastModified) {
      const d = new Date(e.lastModified);
      if (!Number.isNaN(d.getTime()) && (!newest || d > newest)) newest = d;
    }

    if (hubsSet.has(path)) {
      hubs += 1;
      continue;
    }
    if (path.startsWith('/media/news/')) {
      newsArticles += 1;
      continue;
    }
    if (path.startsWith('/products/')) {
      const rest = path.slice('/products/'.length);
      if (!rest) {
        cmsPages += 1; // /products index is a CMS page
        continue;
      }
      if (rest.includes('/')) products += 1;
      else categories += 1;
      continue;
    }
    // Marketing CMS routes (/ , /about, …)
    if (path === '/' || !path.startsWith('/admin')) {
      cmsPages += 1;
      continue;
    }
    other += 1;
  }

  return {
    cmsPages,
    categories,
    products,
    newsArticles,
    hubs,
    other,
    total: entries.length,
    newestLastModified: newest ? newest.toISOString() : null,
  };
}

export function publicSitemapUrl(): string {
  return `${SITE_URL.replace(/\/$/, '')}/sitemap.xml`;
}
