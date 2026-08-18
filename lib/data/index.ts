/**
 * PUBLIC DATA API — the only module UI components may import for content.
 *
 * Phase 1 (now):  every function resolves from lib/data/mock/*.
 * Phase 2 (later): flip USE_REMOTE (or set NEXT_PUBLIC_DATA_SOURCE=remote) and
 *                  lib/data/remote.ts serves the same signatures from the
 *                  dashboard API. No component changes.
 *
 * Rules:
 *  - Components never fetch. They call these functions.
 *  - Every function is async so swapping in a network source is invisible.
 *  - Every function returns a resolved value or null — never throws for
 *    "not found", so pages can call notFound() themselves.
 */
import type {
  Category,
  GalleryImage,
  JobOpening,
  NewsPost,
  Partner,
  Product,
  SiteSettings,
  Video,
} from '@/lib/types';

import { categories as mockCategories } from './mock/categories';
import { products as mockProducts } from './mock/products';
import { news as mockNews } from './mock/news';
import { galleryImages as mockGallery, partners as mockPartners, videos as mockVideos } from './mock/media';
import { jobOpenings as mockJobs, siteSettings as mockSettings } from './mock/settings';
import * as remote from './remote';

/** Single switch for the Phase 2 backend swap. */
const USE_REMOTE = process.env.NEXT_PUBLIC_DATA_SOURCE === 'remote';

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;
const byDateDesc = (a: { publishedAt: string }, b: { publishedAt: string }) =>
  Date.parse(b.publishedAt) - Date.parse(a.publishedAt);

/* -------------------------------------------------------------------------- */
/* Categories                                                                  */
/* -------------------------------------------------------------------------- */

export async function getCategories(): Promise<Category[]> {
  if (USE_REMOTE) return remote.getCategories();
  return [...mockCategories].sort(byOrder);
}

export async function getCategory(slug: string): Promise<Category | null> {
  if (USE_REMOTE) return remote.getCategory(slug);
  return mockCategories.find((c) => c.slug === slug) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Products                                                                    */
/* -------------------------------------------------------------------------- */

export async function getProducts(): Promise<Product[]> {
  if (USE_REMOTE) return remote.getProducts();
  return [...mockProducts].sort(byOrder);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  if (USE_REMOTE) return remote.getProductsByCategory(categorySlug);
  return mockProducts.filter((p) => p.categorySlug === categorySlug).sort(byOrder);
}

export async function getProduct(
  categorySlug: string,
  productSlug: string,
): Promise<Product | null> {
  if (USE_REMOTE) return remote.getProduct(categorySlug, productSlug);
  return (
    mockProducts.find(
      (p) => p.categorySlug === categorySlug && p.slug === productSlug,
    ) ?? null
  );
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

  const others = (await getProducts()).filter(
    (p) => p.categorySlug !== categorySlug,
  );
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
  const all = USE_REMOTE ? await remote.getNews() : [...mockNews].sort(byDateDesc);
  return typeof limit === 'number' ? all.slice(0, limit) : all;
}

export async function getNewsPost(slug: string): Promise<NewsPost | null> {
  if (USE_REMOTE) return remote.getNewsPost(slug);
  return mockNews.find((n) => n.slug === slug) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Media                                                                       */
/* -------------------------------------------------------------------------- */

export async function getGalleryImages(limit?: number): Promise<GalleryImage[]> {
  const all = USE_REMOTE ? await remote.getGalleryImages() : mockGallery;
  return typeof limit === 'number' ? all.slice(0, limit) : all;
}

export async function getVideos(): Promise<Video[]> {
  if (USE_REMOTE) return remote.getVideos();
  return mockVideos;
}

export async function getPartners(): Promise<Partner[]> {
  if (USE_REMOTE) return remote.getPartners();
  return mockPartners;
}

/* -------------------------------------------------------------------------- */
/* Settings & careers                                                          */
/* -------------------------------------------------------------------------- */

export async function getSiteSettings(): Promise<SiteSettings> {
  if (USE_REMOTE) return remote.getSiteSettings();
  return mockSettings;
}

export async function getJobOpenings(): Promise<JobOpening[]> {
  if (USE_REMOTE) return remote.getJobOpenings();
  return mockJobs;
}
