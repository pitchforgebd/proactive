/**
 * PUBLIC DATA API — the only module UI components may import for content.
 *
 * Phase 1 resolved everything from lib/data/mock/*. Phase 2 resolves everything
 * from MySQL via lib/data/remote.ts. That swap is this file, and only this file
 * (PHASE2-BACKEND.md §3) — no component changed to make it happen.
 *
 * Rules:
 *  - Components never fetch. They call these functions.
 *  - Every function is async, so the source can change without callers knowing.
 *  - Every function returns a resolved value or null — never throws for
 *    "not found", so pages can call notFound() themselves.
 *
 * The list-shaping arguments (`limit`) and the derived helpers live here rather
 * than in remote.ts, so they stay identical whatever the backing store is.
 */
import type {
  Category,
  GalleryImage,
  JobOpening,
  NewsPost,
  PageWithSections,
  Partner,
  Product,
  SiteSettings,
  Video,
} from '@/lib/types';

import * as source from './remote';

/* -------------------------------------------------------------------------- */
/* Pages & sections                                                            */
/* -------------------------------------------------------------------------- */

/**
 * A page and its sections, ordered and filtered to the visible ones.
 * `includeHidden` is the dashboard's view; the public site never passes it.
 */
export async function getPage(
  slug: string,
  includeHidden = false,
): Promise<PageWithSections | null> {
  return source.getPage(slug, includeHidden);
}

export async function getAllPageSlugs(): Promise<string[]> {
  return source.getAllPageSlugs();
}

/** Page record without its sections — enough for generateMetadata(). */
export async function getPageMeta(slug: string) {
  return source.getPageMeta(slug);
}

/* -------------------------------------------------------------------------- */
/* Categories                                                                  */
/* -------------------------------------------------------------------------- */

export async function getCategories(): Promise<Category[]> {
  return source.getCategories();
}

export async function getCategory(slug: string): Promise<Category | null> {
  return source.getCategory(slug);
}

/* -------------------------------------------------------------------------- */
/* Products                                                                    */
/* -------------------------------------------------------------------------- */

export async function getProducts(): Promise<Product[]> {
  return source.getProducts();
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  return source.getProductsByCategory(categorySlug);
}

export async function getProduct(
  categorySlug: string,
  productSlug: string,
): Promise<Product | null> {
  return source.getProduct(categorySlug, productSlug);
}

/** Same category first, excluding the current product; falls back to any product. */
export async function getRelatedProducts(
  categorySlug: string,
  excludeSlug: string,
  limit = 4,
): Promise<Product[]> {
  const inCategory = (await getProductsByCategory(categorySlug)).filter(
    (p) => p.slug !== excludeSlug,
  );
  if (inCategory.length >= limit) return inCategory.slice(0, limit);

  const others = (await getProducts()).filter((p) => p.categorySlug !== categorySlug);
  return [...inCategory, ...others].slice(0, limit);
}

/** Flat list for generateStaticParams on /products/[category]/[product]. */
export async function getAllProductPaths(): Promise<
  { category: string; product: string }[]
> {
  const all = await getProducts();
  return all.map((p) => ({ category: p.categorySlug, product: p.slug }));
}

/* -------------------------------------------------------------------------- */
/* News                                                                        */
/* -------------------------------------------------------------------------- */

export async function getNews(limit?: number): Promise<NewsPost[]> {
  const all = await source.getNews();
  return typeof limit === 'number' ? all.slice(0, limit) : all;
}

export async function getNewsPost(slug: string): Promise<NewsPost | null> {
  return source.getNewsPost(slug);
}

/* -------------------------------------------------------------------------- */
/* Media                                                                       */
/* -------------------------------------------------------------------------- */

export async function getGalleryImages(limit?: number): Promise<GalleryImage[]> {
  const all = await source.getGalleryImages();
  return typeof limit === 'number' ? all.slice(0, limit) : all;
}

export async function getVideos(): Promise<Video[]> {
  return source.getVideos();
}

export async function getPartners(): Promise<Partner[]> {
  return source.getPartners();
}

/* -------------------------------------------------------------------------- */
/* Settings & careers                                                          */
/* -------------------------------------------------------------------------- */

export async function getSiteSettings(): Promise<SiteSettings> {
  return source.getSiteSettings();
}

export async function getJobOpenings(): Promise<JobOpening[]> {
  return source.getJobOpenings();
}
