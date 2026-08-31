/**
 * Phase 9 — unit checks for assemblePublicSitemap (no DB / server-only).
 * Run: npx tsx scripts/check-sitemap.ts
 */
import {
  assemblePublicSitemap,
  isPrivateSitemapUrl,
} from '../lib/seo/build-sitemap';
import { absoluteUrl, SITE_URL } from '../lib/utils';

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error('FAIL', msg);
    process.exit(1);
  }
  console.log('ok  ', msg);
}

const now = new Date('2026-08-29T12:00:00.000Z');

const entries = assemblePublicSitemap({
  now,
  pageSlugs: ['home', 'about', 'contact', 'products', 'media', 'career'],
  pagesBySlug: {
    home: { updatedAt: '2026-08-01T00:00:00.000Z' },
    about: { updatedAt: '2026-08-10T00:00:00.000Z' },
    contact: { updatedAt: '2026-08-15T00:00:00.000Z' },
    products: { updatedAt: '2026-08-12T00:00:00.000Z' },
    media: { updatedAt: '2026-08-11T00:00:00.000Z' },
    career: { updatedAt: '2026-08-09T00:00:00.000Z' },
  },
  categories: [
    { slug: 'machineries', createdAt: '2026-01-01T00:00:00.000Z' },
  ],
  products: [
    {
      slug: 'ctp-machine',
      categorySlug: 'machineries',
      createdAt: '2026-02-01T00:00:00.000Z',
    },
    // Orphan — must be excluded
    { slug: 'ghost', categorySlug: 'missing-cat', createdAt: '2026-03-01T00:00:00.000Z' },
  ],
  news: [
    { slug: 'hello', publishedAt: '2026-06-01T00:00:00.000Z' },
    // Future — must be excluded
    { slug: 'future-post', publishedAt: '2027-01-01T00:00:00.000Z' },
  ],
  galleryCount: 3,
  videos: [{ publishedAt: '2026-07-01T00:00:00.000Z' }],
});

const urls = entries.map((e) => e.url);

assert(urls.includes(absoluteUrl('/')), 'includes home');
assert(urls.includes(absoluteUrl('/about')), 'includes CMS about');
assert(urls.includes(absoluteUrl('/products')), 'includes products index');
assert(urls.includes(absoluteUrl('/products/machineries')), 'includes category');
assert(
  urls.includes(absoluteUrl('/products/machineries/ctp-machine')),
  'includes product',
);
assert(urls.includes(absoluteUrl('/media/news/hello')), 'includes published news');
assert(urls.includes(absoluteUrl('/media/news')), 'includes news hub');
assert(urls.includes(absoluteUrl('/media/photo-gallery')), 'includes gallery hub');
assert(urls.includes(absoluteUrl('/media/video-gallery')), 'includes video hub');

assert(!urls.some((u) => u.includes('/products/missing-cat/')), 'excludes orphan product');
assert(!urls.some((u) => u.includes('future-post')), 'excludes future news');
assert(!urls.some((u) => isPrivateSitemapUrl(u)), 'no private/admin/api URLs');
assert(
  !urls.some((u) => u.includes('/admin') || u.includes('/api/')),
  'no admin or api paths',
);

assert(urls.every((u) => u.startsWith(SITE_URL)), 'all URLs use configured site origin');

// Unknown CMS slug without a coded route must not invent a URL
const noInvent = assemblePublicSitemap({
  now,
  pageSlugs: ['home', 'made-up-page'],
  pagesBySlug: { home: { updatedAt: '2026-08-01T00:00:00.000Z' } },
  categories: [],
  products: [],
  news: [],
  galleryCount: 0,
  videos: [],
});
assert(
  !noInvent.some((e) => e.url.includes('made-up-page')),
  'does not invent routes for unknown page slugs',
);

console.log(`\n${entries.length} entries assembled — sitemap unit checks passed.`);
