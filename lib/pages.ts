/**
 * The page slug ↔ public route map (PHASE2-BACKEND.md §9).
 *
 * Two jobs:
 *   · each route file knows which page slug it renders
 *   · every dashboard write revalidates the right public path
 *
 * Pages are FIXED: a route file exists in the repo for each one, so editors can
 * change a page's sections and SEO but cannot invent a page (which would be a
 * route with no code behind it). Adding a page is a developer action — add the
 * slug here and the matching app/ route file.
 *
 * Collection detail routes (/products/[category], /media/news/[slug], …) are
 * not listed: they are driven by their collection, not by sections, and their
 * revalidation paths are built from the record's own slugs.
 */
export const PAGE_SLUGS = [
  'home',
  'about',
  'leadership-message',
  'vision-mission',
  'products',
  'global-sourcing',
  'our-story',
  'company',
  'media',
  'career',
  'contact',
] as const;

export type PageSlug = (typeof PAGE_SLUGS)[number];

export const pagePathMap: Record<PageSlug, string> = {
  home: '/',
  about: '/about',
  'leadership-message': '/about/leadership-message',
  'vision-mission': '/vision-mission',
  products: '/products',
  'global-sourcing': '/global-sourcing',
  'our-story': '/our-story',
  company: '/company',
  media: '/media',
  career: '/career',
  contact: '/contact',
};

/** Human labels for the dashboard's page list. */
export const pageLabels: Record<PageSlug, string> = {
  home: 'Home',
  about: 'About Us',
  'leadership-message': 'Leadership Message',
  'vision-mission': 'Vision & Mission',
  products: 'What We Offer',
  'global-sourcing': 'Global Sourcing',
  'our-story': 'Our Story',
  company: 'Company',
  media: 'Media Centre',
  career: 'Career',
  contact: 'Contact',
};

export function isPageSlug(value: string): value is PageSlug {
  return (PAGE_SLUGS as readonly string[]).includes(value);
}

/** Public route for a page slug, or null if the slug has no route. */
export function pathForPage(slug: string): string | null {
  return isPageSlug(slug) ? pagePathMap[slug] : null;
}

/**
 * App Router collection hubs that are public but are NOT rows in `pages`
 * (those rows drive section-based marketing pages only). Kept here so the
 * sitemap does not invent a second hard-coded marketing route list.
 */
export const PUBLIC_COLLECTION_INDEXES: {
  path: string;
  priority: number;
  changeFrequency: 'weekly' | 'monthly';
}[] = [
  { path: '/media/news', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/media/photo-gallery', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/media/video-gallery', priority: 0.5, changeFrequency: 'monthly' },
];

/** Sitemap priority / frequency for section-based pages (by slug). */
export const sitemapPageMeta: Partial<
  Record<PageSlug, { priority: number; changeFrequency: 'weekly' | 'monthly' }>
> = {
  home: { priority: 1, changeFrequency: 'weekly' },
  about: { priority: 0.8, changeFrequency: 'monthly' },
  'leadership-message': { priority: 0.6, changeFrequency: 'monthly' },
  products: { priority: 0.9, changeFrequency: 'weekly' },
  'vision-mission': { priority: 0.6, changeFrequency: 'monthly' },
  'global-sourcing': { priority: 0.6, changeFrequency: 'monthly' },
  'our-story': { priority: 0.6, changeFrequency: 'monthly' },
  company: { priority: 0.6, changeFrequency: 'monthly' },
  media: { priority: 0.6, changeFrequency: 'weekly' },
  career: { priority: 0.7, changeFrequency: 'weekly' },
  contact: { priority: 0.8, changeFrequency: 'monthly' },
};
