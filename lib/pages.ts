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
  'founder-message',
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
  'founder-message': '/about/founder-message',
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
  'founder-message': 'Message from Founder & CEO',
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
