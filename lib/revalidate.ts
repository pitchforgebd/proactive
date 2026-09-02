/**
 * ON-DEMAND REVALIDATION (PHASE2-BACKEND.md §9).
 *
 * Public pages are ISR with a 60s fallback; these helpers are what make an edit
 * appear in seconds instead. Every successful dashboard write must call the
 * helper for whatever it touched — that is the whole payoff of running Node on
 * cPanel rather than a static export.
 *
 * Keeping the path maths here means a new page or a renamed route is corrected
 * once, not in every action that happens to touch it.
 */
import 'server-only';

import { revalidatePath } from 'next/cache';

import { pathForPage } from './pages';

/**
 * The sitemap is a route like any other, and it lists every category, product
 * and news slug — so it goes stale on exactly the same writes they do.
 */
export function revalidateSitemap() {
  revalidatePath('/sitemap.xml');
}

/**
 * Purge every generated page of a dynamic route at once, e.g.
 * '/products/[category]'. Used when a write can affect sibling pages we cannot
 * name individually — a category rename shifts the product pages under it.
 *
 * NOTE: this does NOT re-run generateStaticParams. That was tried, with
 * `dynamicParams = false`, to turn unknown slugs into real 404s; the new slug
 * was still absent from the static param list and 404'd, so the routes keep the
 * default `dynamicParams = true`. See the soft-404 note in README.
 */
function revalidateRoutePattern(pattern: string) {
  revalidatePath(pattern, 'page');
}

/** A page's own route. Unknown slugs are ignored rather than throwing. */
export function revalidatePage(slug: string) {
  const path = pathForPage(slug);
  if (path) revalidatePath(path);
  // lastModified on sitemap entries comes from pages.updatedAt.
  revalidateSitemap();
}

/**
 * Categories appear on the products page, the home grid and in the header
 * dropdown — which is in the layout, so every page renders it.
 */
export function revalidateCategory(slug?: string, previousSlug?: string) {
  revalidatePath('/products');
  revalidatePage('home');
  if (slug) revalidatePath(`/products/${slug}`);
  // A renamed slug leaves the OLD path cached and still serving. Purge it too,
  // or the category lives on at a URL that no longer exists in the database.
  if (previousSlug && previousSlug !== slug) revalidatePath(`/products/${previousSlug}`);
  // The nav lives in the shared layout: refresh every route's shell.
  revalidatePath('/', 'layout');
  // Rebuild the known-slug list so a new category is reachable immediately.
  revalidateRoutePattern('/products/[category]');
  revalidateSitemap();
}

export function revalidateProduct(
  categorySlug: string,
  slug: string,
  previous?: { categorySlug: string; slug: string },
) {
  revalidatePath('/products');
  revalidatePage('home');
  if (categorySlug) revalidatePath(`/products/${categorySlug}`);
  if (categorySlug && slug) revalidatePath(`/products/${categorySlug}/${slug}`);

  // Renamed, or moved to a different category: the old URL and the old
  // category's listing both need purging.
  if (previous) {
    const moved = previous.categorySlug !== categorySlug;
    const renamed = previous.slug !== slug;
    if (moved && previous.categorySlug) revalidatePath(`/products/${previous.categorySlug}`);
    if ((moved || renamed) && previous.categorySlug && previous.slug) {
      revalidatePath(`/products/${previous.categorySlug}/${previous.slug}`);
    }
  }
  revalidateRoutePattern('/products/[category]/[product]');
  revalidateSitemap();
}

export function revalidateNews(slug?: string, previousSlug?: string) {
  revalidatePath('/media/news');
  revalidatePage('media');
  if (slug) revalidatePath(`/media/news/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/media/news/${previousSlug}`);
  revalidateRoutePattern('/media/news/[slug]');
  revalidateSitemap();
}

/**
 * Reordering changes only the listings, never an individual record's URL — so
 * this purges the list routes without inventing per-record paths.
 */
export function revalidateCollectionLists(key: string) {
  switch (key) {
    case 'categories':
    case 'products':
      revalidatePath('/products');
      revalidatePage('home');
      revalidatePath('/', 'layout');
      revalidateSitemap();
      break;
    case 'news':
      revalidatePath('/media/news');
      revalidatePage('media');
      revalidateSitemap();
      break;
    case 'gallery':
      revalidateGallery();
      break;
    case 'videos':
      revalidateVideos();
      break;
    case 'partners':
      revalidatePartners();
      break;
    case 'jobs':
      revalidateJobs();
      break;
  }
}

export function revalidateGallery() {
  revalidatePath('/media/photo-gallery');
  revalidatePage('media');
  revalidatePage('home');
  revalidateSitemap();
}

export function revalidateVideos() {
  revalidatePath('/media/video-gallery');
  revalidatePage('media');
  revalidateSitemap();
}

export function revalidatePartners() {
  revalidatePage('home');
}

export function revalidateJobs() {
  revalidatePage('career');
}

/** Settings feed the header, footer, contact page and every CTA band. */
export function revalidateSettings() {
  revalidatePath('/', 'layout');
}
