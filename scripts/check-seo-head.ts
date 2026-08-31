/**
 * Phase 8 smoke: sanitizer + metadata builder (no DB writes).
 * Run: npx tsx scripts/check-seo-head.ts
 */
import {
  extractCustomMetaPairs,
  sanitizeCustomHeadTags,
} from '../lib/seo/custom-head';
import { buildSiteSeoMetadata, isGa4Id, isGtmId, isMetaPixelId } from '../lib/seo/site-seo';
import { emptySiteSeo } from '../lib/types';

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error('FAIL', msg);
    process.exit(1);
  }
  console.log('ok  ', msg);
}

const dirty =
  '<script>alert(1)</script><meta name="custom-verify" content="abc123" /><link rel="canonical" href="https://example.com/" />';
const clean = sanitizeCustomHeadTags(dirty);
assert(!/<script/i.test(clean), 'strips script tags');
assert(/custom-verify/.test(clean), 'keeps meta tags');
assert(/canonical/.test(clean), 'keeps safe link tags');
assert(!/javascript:/i.test(sanitizeCustomHeadTags('<link href="javascript:alert(1)">')), 'strips javascript href');
assert(
  extractCustomMetaPairs(dirty).some((p) => p.name === 'custom-verify'),
  'extracts meta pairs',
);

assert(isGa4Id('G-TEST1234') && !isGa4Id('evil'), 'GA4 id shape');
assert(isGtmId('GTM-ABC123') && !isGtmId('GTM'), 'GTM id shape');
assert(isMetaPixelId('1234567890') && !isMetaPixelId('abc'), 'Pixel id shape');

const filled = buildSiteSeoMetadata({
  ...emptySiteSeo(),
  googleVerification: 'GSC-TOKEN-1',
  bingVerification: 'BINGTOKEN',
  yandexVerification: 'YANDEX1',
  facebookDomainVerification: 'FBDOM1',
  pinterestVerification: 'PIN1',
  ahrefsVerification: 'AHREFS1',
  customHeadTags: dirty,
});

assert(filled.verification?.google === 'GSC-TOKEN-1', 'google verification in metadata');
assert(
  (filled.verification?.other as Record<string, string>)?.['msvalidate.01'] === 'BINGTOKEN',
  'bing in verification.other',
);
assert(
  (filled.verification?.other as Record<string, string>)?.['facebook-domain-verification'] ===
    'FBDOM1',
  'facebook domain verification',
);
assert(
  (filled.verification?.other as Record<string, string>)?.['custom-verify'] === 'abc123',
  'custom meta merged',
);

const empty = buildSiteSeoMetadata(emptySiteSeo());
assert(Object.keys(empty).length === 0, 'empty seo yields no metadata keys');

console.log('\nAll SEO head checks passed.');
