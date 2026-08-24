/**
 * Row counts for every table — a fast check that db:push and db:seed did what
 * they claim, and the first thing to run when a page renders empty.
 */
import { sql } from 'drizzle-orm';
import { close, db, schema } from './_db';

const tables = {
  pages: schema.pages,
  sections: schema.sections,
  categories: schema.categories,
  products: schema.products,
  news: schema.news,
  gallery_images: schema.galleryImages,
  videos: schema.videos,
  partners: schema.partners,
  job_openings: schema.jobOpenings,
  career_applications: schema.careerApplications,
  contact_messages: schema.contactMessages,
  settings: schema.settings,
  admin_users: schema.adminUsers,
};

async function main() {
  let total = 0;
  for (const [name, table] of Object.entries(tables)) {
    const [row] = await db.select({ n: sql<number>`count(*)` }).from(table);
    const n = Number(row?.n ?? 0);
    total += n;
    console.log(`${name.padEnd(22)} ${String(n).padStart(5)}`);
  }
  console.log(`${'—'.repeat(28)}\n${'total'.padEnd(22)} ${String(total).padStart(5)}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(close);
