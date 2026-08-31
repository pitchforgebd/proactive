import type { MetadataRoute } from 'next';

import { getPublicSitemapEntries } from '@/lib/seo/sitemap-source';

/**
 * Public sitemap (App Router MetadataRoute → /sitemap.xml).
 *
 * Database-driven via lib/data. No physical file; refreshed by ISR (`revalidate`)
 * + `revalidateSitemap()` on admin writes / Settings → Sitemap refresh.
 */
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getPublicSitemapEntries();
}
