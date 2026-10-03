/**
 * ONE-OFF CONTENT MIGRATION — "Our Business Models" (2026-10)
 *
 *   npx tsx scripts/migrate-business-models-2026-10.ts
 *
 * Global Sourcing's four-pillar valueGrid (Global manufacturer network / Local
 * warehousing / Channel partnerships / Fast response) is replaced with the
 * three-item "showcase" valueGrid (Import & Trading / Indenting & Sourcing /
 * Bulk Industrial Supply) — see lib/data/mock/content.ts `businessModels`.
 *
 * This is a content REPLACEMENT on an existing row, not an insert: the
 * section's id and position in the page are left exactly as they are, only
 * `data` changes. Idempotent — safe to run twice, matches on the section
 * already being the Global Sourcing page's valueGrid and skips if its title
 * shows the migration already landed.
 */
import 'dotenv/config';

import { and, eq } from 'drizzle-orm';

import { businessModels } from '../lib/data/mock/content';
import { sectionRegistry } from '../lib/sections/registry';
import { close, db, schema } from './_db';

const NEXT_DATA = {
  title: 'Our Business Models',
  items: businessModels,
  variant: 'showcase' as const,
  columns: '3' as const,
  tone: 'paper' as const,
  halftone: false,
  cropMarks: false,
};

async function main() {
  console.log('Content migration — "Our Business Models" (2026-10)\n');

  const rows = await db
    .select()
    .from(schema.sections)
    .where(and(eq(schema.sections.pageSlug, 'global-sourcing'), eq(schema.sections.type, 'valueGrid')));

  if (rows.length === 0) {
    console.log('! no valueGrid section on global-sourcing — nothing to update.');
    console.log('  (run scripts/migrate-sections-2026-09.ts first if this is a fresh database)');
    return;
  }

  if (rows.length > 1) {
    console.log(
      `! found ${rows.length} valueGrid sections on global-sourcing — expected exactly one. ` +
        `Stopping rather than guessing which to change: ${rows.map((r) => r.id).join(', ')}`,
    );
    process.exitCode = 1;
    return;
  }

  const row = rows[0];
  const data = row.data as Record<string, unknown>;

  if (data?.title === NEXT_DATA.title && data?.variant === NEXT_DATA.variant) {
    console.log(`= ${row.id} already "Our Business Models" (showcase) — nothing to do.`);
    return;
  }

  const parsed = sectionRegistry.valueGrid.schema.safeParse(NEXT_DATA);
  if (!parsed.success) {
    throw new Error(
      'New content failed the valueGrid schema: ' +
        parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    );
  }

  await db.update(schema.sections).set({ data: NEXT_DATA }).where(eq(schema.sections.id, row.id));

  console.log(`~ ${row.id}: "${String(data?.title ?? '(untitled)')}" -> "Our Business Models"`);
  console.log('\nDone. 1 section updated. Nothing was deleted or reordered.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(close);
