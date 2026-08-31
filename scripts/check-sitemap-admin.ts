/**
 * Phase 10 — verify sitemap summary + config wiring (no server).
 * Run: npx tsx scripts/check-sitemap-admin.ts
 */
import { assemblePublicSitemap } from '../lib/seo/build-sitemap';
import {
  cmsPageSitemapConfig,
  SITEMAP_CONTENT_TYPE_CONFIG,
} from '../lib/seo/sitemap-config';
import {
  publicSitemapUrl,
  summarizeSitemapEntries,
} from '../lib/seo/sitemap-summary';

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error('FAIL', msg);
    process.exit(1);
  }
  console.log('ok  ', msg);
}

const entries = assemblePublicSitemap({
  now: new Date('2026-08-29T12:00:00.000Z'),
  pageSlugs: ['home', 'about', 'products', 'media', 'contact'],
  pagesBySlug: {
    home: { updatedAt: '2026-08-01T00:00:00.000Z' },
    about: { updatedAt: '2026-08-10T00:00:00.000Z' },
    products: { updatedAt: '2026-08-12T00:00:00.000Z' },
    media: { updatedAt: '2026-08-11T00:00:00.000Z' },
    contact: { updatedAt: '2026-08-15T00:00:00.000Z' },
  },
  categories: [{ slug: 'machineries', createdAt: '2026-01-01T00:00:00.000Z' }],
  products: [
    {
      slug: 'ctp-machine',
      categorySlug: 'machineries',
      createdAt: '2026-02-01T00:00:00.000Z',
    },
  ],
  news: [{ slug: 'hello', publishedAt: '2026-06-01T00:00:00.000Z' }],
  galleryCount: 2,
  videos: [{ publishedAt: '2026-07-01T00:00:00.000Z' }],
});

const breakdown = summarizeSitemapEntries(entries);
assert(breakdown.total === entries.length, 'breakdown total matches entries');
assert(breakdown.cmsPages >= 5, 'counts CMS pages');
assert(breakdown.categories === 1, 'counts categories');
assert(breakdown.products === 1, 'counts products');
assert(breakdown.newsArticles === 1, 'counts news');
assert(breakdown.hubs === 3, 'counts hubs');
assert(breakdown.newestLastModified !== null, 'has newest lastmod');

assert(publicSitemapUrl().endsWith('/sitemap.xml'), 'public sitemap URL');

assert(
  SITEMAP_CONTENT_TYPE_CONFIG.some((c) => c.id === 'services' && !c.supported),
  'services marked unsupported',
);
assert(
  SITEMAP_CONTENT_TYPE_CONFIG.some((c) => c.id === 'portfolio' && !c.supported),
  'portfolio marked unsupported',
);
assert(
  SITEMAP_CONTENT_TYPE_CONFIG.some((c) => c.id === 'products' && c.supported),
  'products supported',
);
assert(cmsPageSitemapConfig().length > 0, 'CMS page config rows exist');

console.log('\nSitemap admin unit checks passed.');
