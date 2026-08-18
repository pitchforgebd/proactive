/**
 * PHASE 2 SWAP-IN — dashboard/API implementation of the data API.
 *
 * Nothing here runs until NEXT_PUBLIC_DATA_SOURCE=remote. The functions mirror
 * lib/data/index.ts exactly; the backend team implements the endpoints listed
 * below and this file needs no structural change.
 *
 * Endpoint contract (see HANDOFF.md):
 *   GET  {BASE}/categories                      -> Category[]
 *   GET  {BASE}/categories/:slug                -> Category
 *   GET  {BASE}/products                        -> Product[]
 *   GET  {BASE}/products?category=:slug         -> Product[]
 *   GET  {BASE}/products/:category/:product     -> Product
 *   GET  {BASE}/news                            -> NewsPost[]
 *   GET  {BASE}/news/:slug                      -> NewsPost
 *   GET  {BASE}/gallery                         -> GalleryImage[]
 *   GET  {BASE}/videos                          -> Video[]
 *   GET  {BASE}/partners                        -> Partner[]
 *   GET  {BASE}/settings                        -> SiteSettings
 *   GET  {BASE}/jobs                            -> JobOpening[]
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

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

/** Matches `export const revalidate = 60` on the pages (ISR, Mode A). */
const REVALIDATE_SECONDS = 60;

async function get<T>(path: string): Promise<T> {
  if (!BASE) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL is not set but NEXT_PUBLIC_DATA_SOURCE=remote.',
    );
  }

  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Data request failed: ${path} → ${res.status}`);
  }

  return (await res.json()) as T;
}

/** 404 from the API means "no such record", not an error the page should crash on. */
async function getOrNull<T>(path: string): Promise<T | null> {
  try {
    return await get<T>(path);
  } catch {
    return null;
  }
}

export const getCategories = () => get<Category[]>('/categories');
export const getCategory = (slug: string) =>
  getOrNull<Category>(`/categories/${encodeURIComponent(slug)}`);

export const getProducts = () => get<Product[]>('/products');
export const getProductsByCategory = (categorySlug: string) =>
  get<Product[]>(`/products?category=${encodeURIComponent(categorySlug)}`);
export const getProduct = (categorySlug: string, productSlug: string) =>
  getOrNull<Product>(
    `/products/${encodeURIComponent(categorySlug)}/${encodeURIComponent(productSlug)}`,
  );

export const getNews = () => get<NewsPost[]>('/news');
export const getNewsPost = (slug: string) =>
  getOrNull<NewsPost>(`/news/${encodeURIComponent(slug)}`);

export const getGalleryImages = () => get<GalleryImage[]>('/gallery');
export const getVideos = () => get<Video[]>('/videos');
export const getPartners = () => get<Partner[]>('/partners');
export const getSiteSettings = () => get<SiteSettings>('/settings');
export const getJobOpenings = () => get<JobOpening[]>('/jobs');
