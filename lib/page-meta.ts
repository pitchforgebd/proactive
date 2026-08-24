/**
 * generateMetadata() for the section-driven pages.
 *
 * SEO is per-page content in the dashboard (pages.seo_title / seo_description /
 * og_image), but each route keeps its own explicit file — that is what lets a
 * route set its canonical, and what keeps metadata out of a generic catch-all
 * route (PHASE2-BACKEND.md §6.4).
 *
 * The fallback passed in is the Phase 1 copy for that page. It is used when the
 * database has no override, so an editor who clears a field gets sensible
 * metadata rather than an empty <title>.
 */
import type { Metadata } from 'next';

import { getPageMeta } from '@/lib/data';
import { pagePathMap, type PageSlug } from '@/lib/pages';

interface Fallback {
  title: string;
  description: string;
  /**
   * Bypass the layout's "%s | Proactive Trade International" template. The home
   * page is the whole brand statement already; appending the company name to it
   * reads as a stutter.
   */
  absoluteTitle?: boolean;
}

export function buildPageMetadata(slug: PageSlug, fallback: Fallback) {
  return async function generateMetadata(): Promise<Metadata> {
    const page = await getPageMeta(slug);

    const title = page?.seo?.title || fallback.title;
    const description = page?.seo?.description || fallback.description;
    const ogImage = page?.seo?.ogImage;

    return {
      title: fallback.absoluteTitle ? { absolute: title } : title,
      description,
      alternates: { canonical: pagePathMap[slug] },
      openGraph: {
        title,
        description,
        url: pagePathMap[slug],
        ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      },
    };
  };
}
