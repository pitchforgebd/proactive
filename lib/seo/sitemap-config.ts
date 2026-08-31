/**
 * Sitemap content-type configuration as actually used by assemblePublicSitemap.
 * Read-only for admin — priorities/frequencies live in code (lib/pages + builder),
 * not in a DB settings table. Services / portfolio are not routes in this app.
 */
import {
  PUBLIC_COLLECTION_INDEXES,
  sitemapPageMeta,
  type PageSlug,
} from '@/lib/pages';

export type SitemapChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface SitemapContentTypeConfig {
  id: string;
  label: string;
  description: string;
  /** false = not a public route family in this codebase */
  supported: boolean;
  priority: number | null;
  changeFrequency: SitemapChangeFrequency | null;
  /** How URLs are produced */
  note: string;
}

function pageMetaRange(): { priority: string; changeFrequency: string } {
  const metas = Object.values(sitemapPageMeta);
  if (metas.length === 0) {
    return { priority: '0.6', changeFrequency: 'monthly' };
  }
  const priorities = metas.map((m) => m.priority);
  const freqs = Array.from(new Set(metas.map((m) => m.changeFrequency)));
  const min = Math.min(...priorities);
  const max = Math.max(...priorities);
  return {
    priority: min === max ? String(min) : `${min}–${max}`,
    changeFrequency: freqs.join(' / '),
  };
}

const cmsRange = pageMetaRange();

const hubByPath = Object.fromEntries(
  PUBLIC_COLLECTION_INDEXES.map((h) => [h.path, h]),
);

/**
 * Content types shown in Admin → Settings → Sitemap.
 * Labels map the generic SEO checklist onto this site's real routes.
 */
export const SITEMAP_CONTENT_TYPE_CONFIG: SitemapContentTypeConfig[] = [
  {
    id: 'cms-pages',
    label: 'CMS / marketing pages',
    description: 'Fixed routes driven by the pages table ∩ coded pagePathMap.',
    supported: true,
    priority: null,
    changeFrequency: null,
    note: `Per-page priority ${cmsRange.priority}; change frequency ${cmsRange.changeFrequency} (see page list below).`,
  },
  {
    id: 'categories',
    label: 'Product categories',
    description: 'Public /products/[category] listings (catalogue — not a separate “services” system).',
    supported: true,
    priority: 0.8,
    changeFrequency: 'weekly',
    note: 'One URL per category row in the database.',
  },
  {
    id: 'products',
    label: 'Products',
    description: 'Public /products/[category]/[product] detail pages.',
    supported: true,
    priority: 0.7,
    changeFrequency: 'monthly',
    note: 'Only products whose category still exists are listed.',
  },
  {
    id: 'news',
    label: 'News articles',
    description: 'Published posts at /media/news/[slug].',
    supported: true,
    priority: 0.5,
    changeFrequency: 'yearly',
    note: 'Future-dated publishedAt values are excluded.',
  },
  {
    id: 'news-hub',
    label: 'News index',
    description: 'Hub at /media/news.',
    supported: true,
    priority: hubByPath['/media/news']?.priority ?? 0.7,
    changeFrequency: hubByPath['/media/news']?.changeFrequency ?? 'weekly',
    note: 'Collection index (not a pages-table row).',
  },
  {
    id: 'gallery',
    label: 'Photo gallery',
    description: 'Hub at /media/photo-gallery (no per-image public URLs).',
    supported: true,
    priority: hubByPath['/media/photo-gallery']?.priority ?? 0.5,
    changeFrequency: hubByPath['/media/photo-gallery']?.changeFrequency ?? 'monthly',
    note: 'Images appear on the hub page only.',
  },
  {
    id: 'videos',
    label: 'Video gallery',
    description: 'Hub at /media/video-gallery (no per-video public URLs).',
    supported: true,
    priority: hubByPath['/media/video-gallery']?.priority ?? 0.5,
    changeFrequency: hubByPath['/media/video-gallery']?.changeFrequency ?? 'monthly',
    note: 'YouTube embeds on the hub page only.',
  },
  {
    id: 'services',
    label: 'Services',
    description: 'Not implemented as a separate public collection on this site.',
    supported: false,
    priority: null,
    changeFrequency: null,
    note: 'Use Product categories / Products.',
  },
  {
    id: 'portfolio',
    label: 'Portfolio / projects',
    description: 'Not implemented as a separate public collection on this site.',
    supported: false,
    priority: null,
    changeFrequency: null,
    note: 'Use Products for catalogue detail URLs.',
  },
];

/** Per CMS page priority/frequency for the admin config table. */
export function cmsPageSitemapConfig(): Array<{
  slug: PageSlug;
  priority: number;
  changeFrequency: SitemapChangeFrequency;
}> {
  return (Object.keys(sitemapPageMeta) as PageSlug[]).map((slug) => {
    const meta = sitemapPageMeta[slug]!;
    return {
      slug,
      priority: meta.priority,
      changeFrequency: meta.changeFrequency,
    };
  });
}
