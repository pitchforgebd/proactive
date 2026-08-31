/**
 * Phase 8/11 live head smoke: set SEO values → fetch / → assert tags → restore.
 * Usage: npx tsx scripts/smoke-seo-public-head.ts [baseUrl]
 * Prefer next:dev (or a freshly revalidated server) so layout metadata is live.
 */
import 'dotenv/config';

import { eq } from 'drizzle-orm';

import { sanitizeCustomHeadTags } from '../lib/seo/custom-head';
import { close, db, schema } from './_db';

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');

async function main() {
  console.log('base', base);

  const [before] = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.id, 1))
    .limit(1);
  if (!before) {
    console.error('No settings row (id=1).');
    process.exit(1);
  }

  const snapshot = {
    seoGoogleVerification: before.seoGoogleVerification,
    seoBingVerification: before.seoBingVerification,
    seoGa4Id: before.seoGa4Id,
    seoGtmId: before.seoGtmId,
    seoMetaPixelId: before.seoMetaPixelId,
    seoFacebookDomainVerification: before.seoFacebookDomainVerification,
    seoYandexVerification: before.seoYandexVerification,
    seoPinterestVerification: before.seoPinterestVerification,
    seoAhrefsVerification: before.seoAhrefsVerification,
    seoCustomHeadTags: before.seoCustomHeadTags,
  };

  try {
    await db
      .update(schema.settings)
      .set({
        seoGoogleVerification: 'phase8-gsc-test-token',
        seoBingVerification: 'phase8-bing-test',
        seoGa4Id: 'G-PHASE8TEST1',
        seoGtmId: 'GTM-PHASE81',
        seoYandexVerification: 'phase8-yandex',
        seoFacebookDomainVerification: 'phase8-fb-domain',
        seoPinterestVerification: 'phase8-pin',
        seoAhrefsVerification: 'phase8-ahrefs',
        seoMetaPixelId: '123456789012345',
        seoCustomHeadTags: sanitizeCustomHeadTags(
          '<meta name="x-custom-head" content="phase8-custom" /><script>bad()</script>',
        ),
      })
      .where(eq(schema.settings.id, 1));

    const res = await fetch(`${base}/?_seo_smoke=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      cache: 'no-store',
    });
    const html = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const checks: [string, boolean][] = [
      ['google-site-verification', html.includes('phase8-gsc-test-token')],
      ['msvalidate.01', html.includes('phase8-bing-test')],
      ['yandex-verification', html.includes('phase8-yandex')],
      ['facebook-domain-verification', html.includes('phase8-fb-domain')],
      ['pinterest-site-verification', html.includes('phase8-pin')],
      ['ahrefs-site-verification', html.includes('phase8-ahrefs')],
      ['custom meta', html.includes('phase8-custom')],
      ['GA4 id', html.includes('G-PHASE8TEST1')],
      ['GTM id', html.includes('GTM-PHASE81')],
      ['Meta Pixel id', html.includes('123456789012345')],
      ['no raw script from custom', !html.includes('bad()')],
      ['preserves og:title', /og:title/i.test(html)],
      [
        'no duplicate google verification meta',
        (html.match(/<meta[^>]*google-site-verification[^>]*>/gi) || []).length <= 1,
      ],
    ];

    let failed = 0;
    for (const [label, ok] of checks) {
      console.log(ok ? 'ok  ' : 'FAIL', label);
      if (!ok) failed += 1;
    }

    await db
      .update(schema.settings)
      .set({
        seoGoogleVerification: null,
        seoBingVerification: null,
        seoGa4Id: null,
        seoGtmId: null,
        seoMetaPixelId: null,
        seoFacebookDomainVerification: null,
        seoYandexVerification: null,
        seoPinterestVerification: null,
        seoAhrefsVerification: null,
        seoCustomHeadTags: null,
      })
      .where(eq(schema.settings.id, 1));

    const clearedRes = await fetch(`${base}/?_seo_clear=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      cache: 'no-store',
    });
    const cleared = await clearedRes.text();
    const gone =
      !cleared.includes('phase8-gsc-test-token') &&
      !cleared.includes('G-PHASE8TEST1') &&
      !cleared.includes('GTM-PHASE81') &&
      !cleared.includes('phase8-custom');
    console.log(gone ? 'ok  ' : 'FAIL', 'cleared values omit tags');
    if (!gone) failed += 1;

    if (failed) {
      console.error(`\n${failed} check(s) failed.`);
      process.exitCode = 1;
    } else {
      console.log('\nPublic head save/update/remove smoke passed.');
    }
  } finally {
    await db.update(schema.settings).set(snapshot).where(eq(schema.settings.id, 1));
    console.log('restored previous settings snapshot');
    await close();
  }
}

main().catch(async (err) => {
  console.error(err);
  try {
    await close();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
