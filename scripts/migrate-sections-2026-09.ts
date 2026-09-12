/**
 * ONE-OFF CONTENT MIGRATION — 2026-09 design pass
 *
 *   npx tsx scripts/migrate-sections-2026-09.ts
 *
 * Brings an EXISTING database (production) up to the content this release
 * expects, WITHOUT the destructive full reseed. `npm run db:seed` deletes every
 * page and section row before rewriting them, so it must never be run against a
 * database an editor has touched (docs/CPANEL_DEPLOYMENT.md).
 *
 * What it does, all additive and all idempotent — safe to run twice:
 *   1. home            → adds the "globalNetwork" section after Capabilities
 *   2. global-sourcing → adds "globalNetwork" + "countriesGrid" after the page header
 *   3. home            → switches "Why Choose Us" from the hairline cards to
 *                        the new registration-corner "proof" layout
 *
 * Nothing is deleted, and any section an editor has already added is left in
 * place — existing rows are only ever shifted in `order`, never rewritten.
 *
 * NOTE: the `settings.logo_dark` / `settings.logo_footer` COLUMNS are a schema
 * change and are NOT handled here — add those with ALTER TABLE first.
 */
import 'dotenv/config';

import { and, eq, gte, sql } from 'drizzle-orm';

import {
  globalNetworkBody,
  globalNetworkStats,
  sourcingCountries,
} from '../lib/data/mock/content';
import { sanitizeHtml } from '../lib/sanitize';
import { sectionRegistry, type SectionType } from '../lib/sections/registry';
import { close, db, schema } from './_db';

type PageSlug = 'home' | 'global-sourcing';

interface Planned {
  id: string;
  pageSlug: PageSlug;
  type: SectionType;
  data: Record<string, unknown>;
  /** Insert directly after the first section of this type. */
  afterType: SectionType;
}

const globalNetworkData = {
  eyebrow: 'Strategic Network',
  heading: 'World-Class Quality,\nSourced Globally.',
  html: `<p>${globalNetworkBody}</p>`,
  stats: globalNetworkStats,
  mapIcon: 'Globe2',
  mapHeading: 'Global Reach',
  mapText:
    'Seamless integration from international manufacturers directly to local industries.',
  tone: 'paper-2',
};

const planned: Planned[] = [
  {
    id: 'home-globalnetwork',
    pageSlug: 'home',
    type: 'globalNetwork',
    data: globalNetworkData,
    afterType: 'capabilities',
  },
  {
    id: 'gs-globalnetwork',
    pageSlug: 'global-sourcing',
    type: 'globalNetwork',
    data: globalNetworkData,
    afterType: 'pageHero',
  },
  {
    id: 'gs-countriesgrid',
    pageSlug: 'global-sourcing',
    type: 'countriesGrid',
    data: {
      title: 'Countries We Source From',
      lede: 'A strategic footprint across key industrial manufacturing hubs globally.',
      countries: sourcingCountries,
      tone: 'paper',
    },
    afterType: 'globalNetwork',
  },
];

/** Sanitize rich HTML on the way in, exactly as the dashboard does. */
function clean(data: Record<string, unknown>) {
  const out = { ...data };
  if (typeof out.html === 'string') out.html = sanitizeHtml(out.html);
  return out;
}

async function addSection(p: Planned): Promise<boolean> {
  const rows = await db
    .select()
    .from(schema.sections)
    .where(eq(schema.sections.pageSlug, p.pageSlug));

  // Match on TYPE, not on our own id: on a database seeded earlier the same
  // section exists under a seed-generated id (home-07, global-sourcing-02 …).
  // Keying off the id would not find it and would insert a duplicate.
  const existing = rows.find((r) => r.type === p.type);
  if (existing) {
    console.log(`  = ${p.pageSlug}/${p.type} already present (${existing.id})`);
    return false;
  }

  const anchor = rows
    .filter((r) => r.type === p.afterType)
    .sort((a, b) => a.order - b.order)[0];

  if (!anchor) {
    console.log(
      `  ! ${p.pageSlug}: no "${p.afterType}" to anchor to — skipped (add it in the dashboard)`,
    );
    return false;
  }

  const position = anchor.order + 1;

  // Validate before writing, the way SectionRenderer will on the way out.
  const parsed = sectionRegistry[p.type].schema.safeParse(p.data);
  if (!parsed.success) {
    throw new Error(
      `${p.id} failed the "${p.type}" schema: ` +
        parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    );
  }

  // Make room: push everything at or after the slot down by one.
  await db
    .update(schema.sections)
    .set({ order: sql`${schema.sections.order} + 1` })
    .where(
      and(eq(schema.sections.pageSlug, p.pageSlug), gte(schema.sections.order, position)),
    );

  await db.insert(schema.sections).values({
    id: p.id,
    pageSlug: p.pageSlug,
    type: p.type,
    order: position,
    visible: true,
    data: clean(p.data),
  });

  console.log(`  + ${p.pageSlug}/${p.type} inserted at order ${position} (${p.id})`);
  return true;
}

/** Why Choose Us: hairline cards → registration-corner "proof" frames. */
async function switchWhyChooseUsVariant(): Promise<boolean> {
  const rows = await db
    .select()
    .from(schema.sections)
    .where(and(eq(schema.sections.pageSlug, 'home'), eq(schema.sections.type, 'valueGrid')));

  for (const row of rows) {
    const data = row.data as Record<string, unknown>;
    if (data?.eyebrow !== 'Why Choose Us') continue;
    if (data.variant === 'proof') {
      console.log(`  = ${row.id} already "proof"`);
      return false;
    }
    await db
      .update(schema.sections)
      .set({ data: { ...data, variant: 'proof' } })
      .where(eq(schema.sections.id, row.id));
    console.log(`  ~ ${row.id} variant "${String(data.variant)}" -> "proof"`);
    return true;
  }

  console.log('  ! no home "Why Choose Us" valueGrid found — skipped');
  return false;
}

async function main() {
  console.log('Content migration — 2026-09 design pass\n');

  console.log('Sections:');
  let changes = 0;
  for (const p of planned) {
    if (await addSection(p)) changes += 1;
  }

  console.log('\nVariants:');
  if (await switchWhyChooseUsVariant()) changes += 1;

  console.log(`\nDone. ${changes} change(s). Nothing was deleted.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(close);
