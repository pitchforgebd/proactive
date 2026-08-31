/**
 * Replace abstract CMYK placeholders with real demo photography.
 *
 * Uses a pool of verified Unsplash photo IDs (same pathnames as seed/DB).
 * Falls back to picsum.photos if Unsplash returns 404.
 * Skips brand/partner logo plates.
 *
 *   npm run demo:images
 */
import { createWriteStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'images');

/** Verified Unsplash IDs (checked against live CDN). */
const POOL = [
  '1565793298595-6a879b1d9492',
  '1581091226825-a6a2a5aee158',
  '1586528116311-ad8dd3c8310d',
  '1581092918056-0c4c3acd3789',
  '1595078475328-1ab05d0a6a0e',
  '1578575437130-527eed3abbec',
  '1605745341112-85968b19335b',
  '1497633762265-9d179a990aa6',
  '1581092160562-40aa08e78837',
  '1565043589221-1a6fd9ae45c7',
  '1581092162384-8987c1d64718',
  '1626785774625-ddcddc3445e9',
  '1611532736597-de2d4265fba3',
  '1553413077-190dd305871c',
  '1607344645866-009c320b63e0',
  '1460925895917-afdab827c52f',
  '1486312338219-ce68d2c6f44d',
  '1497366216548-37526070297c',
  '1522071820081-009f0129c71c',
  '1553877522-43269d4ea984',
  '1556761175-5973dc0f32e7',
  '1517245386807-bb43f82c33c4',
  '1560250097-0b93528c311a',
  '1556761175-b413da4baf72',
  '1522202176988-66273c2fd55f',
  '1519389950473-47ba0277781c',
  '1497366811353-6870744d04b2',
  '1531403009284-440f080d1e12',
  '1563986768609-322da13575f3',
  '1618005182384-a83a8bd57fbe',
];

/** [relPath, width, height] — every content image used by cards/sliders/products. */
const TARGETS = [
  ['hero/hero-01.png', 1920, 1080],
  ['hero/hero-02.png', 1920, 1080],
  ['hero/hero-03.png', 1920, 1080],

  ['categories/machineries-solutions.png', 1200, 750],
  ['categories/press-room-chemicals-solutions.png', 1200, 750],
  ['categories/inks-and-coatings-solutions.png', 1200, 750],
  ['categories/blankets-plates-adhesives-papers-solutions.png', 1200, 750],

  ['solutions/commercial-printing.png', 900, 900],
  ['solutions/packaging.png', 900, 900],
  ['solutions/label-printing.png', 900, 900],
  ['solutions/corrugation.png', 900, 900],
  ['solutions/newspaper-printing.png', 900, 900],
  ['solutions/publishing.png', 900, 900],
  ['solutions/digital-printing.png', 900, 900],
  ['solutions/consumables.png', 900, 900],

  ['products/ctp-machine-1.png', 1200, 900],
  ['products/ctp-machine-2.png', 1200, 900],
  ['products/ctp-machine-3.png', 1200, 900],
  ['products/ctcp-machine-1.png', 1200, 900],
  ['products/ctcp-machine-2.png', 1200, 900],
  ['products/flexo-ctp-machine-1.png', 1200, 900],
  ['products/flexo-ctp-machine-2.png', 1200, 900],
  ['products/uv-coating-machine-1.png', 1200, 900],
  ['products/uv-coating-machine-2.png', 1200, 900],
  ['products/fountain-solution-1.png', 1200, 900],
  ['products/fountain-solution-2.png', 1200, 900],
  ['products/uv-blanket-wash-1.png', 1200, 900],
  ['products/offset-sheetfed-ink-1.png', 1200, 900],
  ['products/offset-sheetfed-ink-2.png', 1200, 900],
  ['products/uv-led-ink-1.png', 1200, 900],
  ['products/rubber-offset-blanket-1.png', 1200, 900],
  ['products/rubber-offset-blanket-2.png', 1200, 900],
  ['products/thermal-ctp-plate-1.png', 1200, 900],
  ['products/thermal-ctp-plate-2.png', 1200, 900],
  ['products/uv-ctcp-plate-1.png', 1200, 900],
  ['products/packaging-adhesives-1.png', 1200, 900],

  ['news/warehouse-expansion.png', 1200, 750],
  ['news/flexo-ctp-commissioning.png', 1200, 750],
  ['news/technical-support-team.png', 1200, 750],
  ['news/manufacturer-partnership.png', 1200, 750],

  ['gallery/gallery-01.png', 1200, 900],
  ['gallery/gallery-02.png', 1200, 900],
  ['gallery/gallery-03.png', 1200, 900],
  ['gallery/gallery-04.png', 1200, 900],
  ['gallery/gallery-05.png', 1200, 900],
  ['gallery/gallery-06.png', 1200, 900],
  ['gallery/gallery-07.png', 1200, 900],
  ['gallery/gallery-08.png', 1200, 900],
  ['gallery/gallery-09.png', 1200, 900],
  ['gallery/gallery-10.png', 1200, 900],
  ['gallery/gallery-11.png', 1200, 900],
  ['gallery/gallery-12.png', 1200, 900],

  ['about/about-company.png', 1200, 750],
  ['about/founder-portrait.png', 900, 1125],
  ['about/global-sourcing.png', 1200, 750],
  ['about/our-story.png', 1200, 750],
  ['about/company-profile.png', 1200, 750],
  ['about/vision-mission.png', 1200, 750],
  ['about/career.png', 1200, 750],
  ['og/og-default.png', 1200, 630],
];

function unsplashUrl(id, w, h) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

function picsumUrl(seed, w, h) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

async function save(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'proactive-demo-images/1.0' },
    redirect: 'follow',
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  mkdirSync(dirname(dest), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  if (!existsSync(dest) || statSync(dest).size < 2000) {
    throw new Error('file too small / missing');
  }
}

async function downloadOne(rel, w, h, index) {
  const dest = join(OUT, rel);
  const id = POOL[index % POOL.length];
  try {
    await save(unsplashUrl(id, w, h), dest);
    return 'unsplash';
  } catch {
    await save(picsumUrl(rel.replace(/[\\/]/g, '-'), w, h), dest);
    return 'picsum';
  }
}

async function main() {
  let ok = 0;
  let fail = 0;
  for (let i = 0; i < TARGETS.length; i++) {
    const [rel, w, h] = TARGETS[i];
    try {
      process.stdout.write(`↓ ${rel} … `);
      const src = await downloadOne(rel, w, h, i);
      console.log(src);
      ok++;
    } catch (err) {
      fail++;
      console.log('FAIL', err instanceof Error ? err.message : err);
    }
  }
  console.log(`\nDemo photos: ${ok} written, ${fail} failed.`);
  console.log('Unchanged: partners/* and about/*-logo.png');
  if (fail) process.exit(1);
}

main();
