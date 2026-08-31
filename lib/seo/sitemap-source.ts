/**
 * Shared fetch → assemble path for the public sitemap.
 * Used by app/sitemap.ts and the admin Sitemap panel (same entries).
 */
import 'server-only';

import {
  getAllPageSlugs,
  getCategories,
  getGalleryImages,
  getNews,
  getPageMeta,
  getProducts,
  getVideos,
} from '@/lib/data';
import {
  assemblePublicSitemap,
  type SitemapSource,
} from '@/lib/seo/build-sitemap';
import type { MetadataRoute } from 'next';

export async function loadSitemapSource(): Promise<SitemapSource> {
  const [pageSlugs, categories, products, news, gallery, videos] =
    await Promise.all([
      getAllPageSlugs(),
      getCategories(),
      getProducts(),
      getNews(),
      getGalleryImages(),
      getVideos(),
    ]);

  const pagesBySlug: SitemapSource['pagesBySlug'] = {};
  await Promise.all(
    pageSlugs.map(async (slug) => {
      pagesBySlug[slug] = await getPageMeta(slug);
    }),
  );

  return {
    pageSlugs,
    pagesBySlug,
    categories,
    products,
    news,
    galleryCount: gallery.length,
    videos,
  };
}

/** Live public sitemap entries (identical to /sitemap.xml generation). */
export async function getPublicSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  return assemblePublicSitemap(await loadSitemapSource());
}
