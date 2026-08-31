/**
 * Fetch live /sitemap.xml and assert public URLs in / private out.
 * Usage: npx tsx scripts/smoke-sitemap-xml.ts [baseUrl]
 */
import 'dotenv/config';

import { isPrivateSitemapUrl } from '../lib/seo/build-sitemap';
import { SITE_URL } from '../lib/utils';

const base = (process.argv[2] || 'http://localhost:3010').replace(/\/$/, '');

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error('FAIL', msg);
    process.exit(1);
  }
  console.log('ok  ', msg);
}

async function main() {
  console.log('SITE_URL', SITE_URL);

  const res = await fetch(`${base}/sitemap.xml`);
  const xml = await res.text();
  assert(res.ok, `HTTP ${res.status} for /sitemap.xml`);
  assert(xml.includes('<urlset'), 'is a urlset sitemap');

  const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
  assert(locs.length > 0, `has loc entries (${locs.length})`);

  const must = [
    `${SITE_URL}/`,
    `${SITE_URL}/about`,
    `${SITE_URL}/products`,
    `${SITE_URL}/media/news`,
    `${SITE_URL}/media/photo-gallery`,
    `${SITE_URL}/media/video-gallery`,
    `${SITE_URL}/contact`,
  ];
  for (const u of must) {
    assert(locs.includes(u), `includes ${u}`);
  }

  assert(
    locs.some((u) => u.startsWith(`${SITE_URL}/products/`) && u !== `${SITE_URL}/products`),
    'includes at least one category or product URL',
  );
  assert(
    locs.some((u) => u.startsWith(`${SITE_URL}/media/news/`)),
    'includes at least one news article URL',
  );

  assert(
    !locs.some((u) => isPrivateSitemapUrl(u) || u.includes('/admin') || u.includes('/api/')),
    'excludes admin/api/private URLs',
  );

  const robots = await fetch(`${base}/robots.txt`);
  const robotsTxt = await robots.text();
  assert(robots.ok, 'robots.txt OK');
  assert(robotsTxt.includes('Sitemap:'), 'robots references Sitemap');
  assert(robotsTxt.includes('/sitemap.xml'), 'robots points at /sitemap.xml');
  assert(robotsTxt.includes('Disallow: /admin/'), 'robots disallows /admin/');

  console.log(`\nLive sitemap smoke passed (${locs.length} URLs) against ${base}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
