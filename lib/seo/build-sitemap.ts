/**
 * Assemble the public sitemap from already-fetched public data.
 *
 * Pure (no DB imports) so unit checks can run without `server-only`.
 * This site has no services/portfolio routes — public collections are
 * CMS pages, product categories/products, news, and media gallery hubs.
 */
import type { MetadataRoute } from 'next';

import {
  isPageSlug,
  PAGE_SLUGS,
  pathForPage,
  PUBLIC_COLLECTION_INDEXES,
  sitemapPageMeta,
  type PageSlug,
} from '@/lib/pages';
import type { Category, NewsPost, Page, Product, Video } from '@/lib/types';
import { absoluteUrl } from '@/lib/utils';

const FALLBACK_META = {
  priority: 0.6,
  changeFrequency: 'monthly' as const,
};

export interface SitemapSource {
  /** Slugs from the CMS `pages` table. */
  pageSlugs: string[];
  /** Optional page meta keyed by slug (for lastModified). */
  pagesBySlug: Record<string, Pick<Page, 'updatedAt'> | null | undefined>;
  categories: Array<Pick<Category, 'slug'> & { createdAt?: string }>;
  products: Array<
    Pick<Product, 'slug' | 'categorySlug'> & { createdAt?: string }
  >;
  news: Array<Pick<NewsPost, 'slug' | 'publishedAt'>>;
  /** Used only for gallery hub lastModified (no per-image public URLs). */
  galleryCount: number;
  videos: Array<Pick<Video, 'publishedAt'>>;
  /** Override "now" in tests. */
  now?: Date;
}

function parseDate(value: string | undefined | null, fallback: Date): Date {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function latestDate(dates: Array<string | undefined>, fallback: Date): Date {
  let best: Date | null = null;
  for (const raw of dates) {
    if (!raw) continue;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) continue;
    if (!best || d > best) best = d;
  }
  return best ?? fallback;
}

function entry(
  path: string,
  lastModified: Date,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  };
}

/**
 * Build deduplicated public sitemap entries.
 * Excludes admin/api/auth; only includes paths that exist as public App Router routes.
 */
export function assemblePublicSitemap(source: SitemapSource): MetadataRoute.Sitemap {
  const now = source.now ?? new Date();
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();

  const put = (item: MetadataRoute.Sitemap[number]) => {
    const existing = byUrl.get(item.url);
    if (!existing) {
      byUrl.set(item.url, item);
      return;
    }
    // Prefer the newer lastModified if duplicates somehow appear.
    const a = existing.lastModified ? new Date(existing.lastModified).getTime() : 0;
    const b = item.lastModified ? new Date(item.lastModified).getTime() : 0;
    if (b >= a) byUrl.set(item.url, item);
  };

  const candidateSlugs =
    source.pageSlugs.length > 0 ? source.pageSlugs : [...PAGE_SLUGS];

  for (const slug of candidateSlugs) {
    const path = pathForPage(slug);
    if (!path) continue; // no coded public route (and never invent one)

    const meta = isPageSlug(slug)
      ? (sitemapPageMeta[slug as PageSlug] ?? FALLBACK_META)
      : FALLBACK_META;

    const page = source.pagesBySlug[slug];
    put(
      entry(
        path,
        parseDate(page?.updatedAt, now),
        meta.changeFrequency,
        meta.priority,
      ),
    );
  }

  const categorySlugs = new Set(source.categories.map((c) => c.slug));

  for (const index of PUBLIC_COLLECTION_INDEXES) {
    let lastModified = now;
    if (index.path === '/media/photo-gallery' && source.galleryCount > 0) {
      lastModified = now;
    }
    if (index.path === '/media/video-gallery' && source.videos.length > 0) {
      lastModified = latestDate(
        source.videos.map((v) => v.publishedAt),
        now,
      );
    }
    if (index.path === '/media/news' && source.news.length > 0) {
      lastModified = latestDate(
        source.news.map((n) => n.publishedAt),
        now,
      );
    }
    put(entry(index.path, lastModified, index.changeFrequency, index.priority));
  }

  for (const c of source.categories) {
    put(
      entry(
        `/products/${c.slug}`,
        parseDate(c.createdAt, now),
        'weekly',
        0.8,
      ),
    );
  }

  // Only products under a known public category (orphan categorySlug → skip).
  for (const p of source.products) {
    if (!categorySlugs.has(p.categorySlug)) continue;
    put(
      entry(
        `/products/${p.categorySlug}/${p.slug}`,
        parseDate(p.createdAt, now),
        'monthly',
        0.7,
      ),
    );
  }

  // News: skip future-dated rows (treated as not yet public).
  for (const n of source.news) {
    const published = parseDate(n.publishedAt, now);
    if (published.getTime() > now.getTime()) continue;
    put(entry(`/media/news/${n.slug}`, published, 'yearly', 0.5));
  }

  return Array.from(byUrl.values());
}

/** Fail closed in checks: sitemap must never list private surfaces. */
export function isPrivateSitemapUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname;
    return (
      path.startsWith('/admin') ||
      path.startsWith('/api') ||
      path.includes('/login') ||
      path.startsWith('/_next')
    );
  } catch {
    return true;
  }
}
