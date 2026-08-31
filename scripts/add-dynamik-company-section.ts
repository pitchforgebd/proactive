/**
 * Insert DYNAMIK brand section on /company after Zexora (idempotent).
 * Run: npx tsx scripts/add-dynamik-company-section.ts
 */
import 'dotenv/config';

import { randomUUID } from 'node:crypto';

import { asc, eq } from 'drizzle-orm';

import { dynamikBrand } from '../lib/data/mock/content';
import { parentCompanySchema } from '../lib/sections/schemas';
import { close, db, schema } from './_db';

async function main() {
  const rows = await db
    .select()
    .from(schema.sections)
    .where(eq(schema.sections.pageSlug, 'company'))
    .orderBy(asc(schema.sections.order));

  const already = rows.find((r) => {
    if (r.type !== 'parentCompany') return false;
    const data = r.data as { name?: string };
    return data?.name === 'DYNAMIK';
  });

  const data = parentCompanySchema.parse({
    eyebrow: dynamikBrand.role,
    index: '03',
    logo: dynamikBrand.logo,
    logoSurface: 'paper',
    name: dynamikBrand.name,
    tagline: dynamikBrand.tagline,
    description: dynamikBrand.description,
    tone: 'paper-2',
  });

  if (already) {
    await db
      .update(schema.sections)
      .set({ data, visible: true, updatedAt: new Date() })
      .where(eq(schema.sections.id, already.id));
    console.log('updated existing DYNAMIK section', already.id);
  } else {
    const zexora = rows.find((r) => {
      if (r.type !== 'parentCompany') return false;
      const d = r.data as { name?: string };
      return d?.name === 'Zexora' || /zexora/i.test(String(d?.name ?? ''));
    });

    const insertOrder = zexora ? zexora.order + 1 : rows.length;

    // Shift later sections down so DYNAMIK sits right after Zexora.
    for (const row of rows.filter((r) => r.order >= insertOrder).reverse()) {
      await db
        .update(schema.sections)
        .set({ order: row.order + 1 })
        .where(eq(schema.sections.id, row.id));
    }

    const id = randomUUID();
    await db.insert(schema.sections).values({
      id,
      pageSlug: 'company',
      type: 'parentCompany',
      order: insertOrder,
      visible: true,
      data,
    });
    console.log('inserted DYNAMIK section', id, 'at order', insertOrder);
  }

  // Touch page updatedAt for sitemap lastmod.
  await db
    .update(schema.pages)
    .set({ updatedAt: new Date() })
    .where(eq(schema.pages.slug, 'company'));

  console.log('done — restart/revalidate /company to see it (ISR 60s or admin save).');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await close();
  });
