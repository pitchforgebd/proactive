/**
 * DATABASE SEED —  npm run db:seed
 *
 * Fills an empty database with the Phase 1 site: every page and its sections
 * (scripts/seed-pages.ts), every collection (from the lib/data/mock fixtures,
 * which hold CLAUDE.md §9's content), global settings, and one admin user.
 *
 * RE-RUNNABLE. Content tables are cleared and rewritten, so running it twice
 * gives the same result. Two things are deliberately never destroyed:
 *
 *   career_applications / contact_messages — real submissions from the public
 *     site. Losing an enquiry to a re-seed would be unforgivable.
 *   admin_users — upserted by email, so an admin's chosen password survives.
 *
 * Rich HTML is sanitized on the way in, exactly as the dashboard will do it.
 */
import 'dotenv/config';

import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { categories as mockCategories } from '../lib/data/mock/categories';
import {
  galleryImages as mockGallery,
  partners as mockPartners,
  videos as mockVideos,
} from '../lib/data/mock/media';
import { news as mockNews } from '../lib/data/mock/news';
import { products as mockProducts } from '../lib/data/mock/products';
import { jobOpenings as mockJobs, siteSettings } from '../lib/data/mock/settings';
import { pageLabels } from '../lib/pages';
import { sanitizeHtml } from '../lib/sanitize';
import { sectionRegistry } from '../lib/sections/registry';
import { assertPagesCovered, seedPages } from './seed-pages';
import { close, db, schema } from './_db';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@proactive.com.bd';

function adminPassword(): { password: string; generated: boolean } {
  const fromEnv = process.env.ADMIN_PASSWORD;
  if (fromEnv && fromEnv.length >= 8) return { password: fromEnv, generated: false };
  // No password configured: mint one and print it once, rather than baking a
  // guessable default into every install.
  const password = `pti-${Math.random().toString(36).slice(2, 10)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  return { password, generated: true };
}

/* -------------------------------------------------------------------------- */

async function seedPagesAndSections() {
  assertPagesCovered();

  await db.delete(schema.sections);
  await db.delete(schema.pages);

  let sectionCount = 0;

  for (const page of seedPages) {
    await db.insert(schema.pages).values({
      slug: page.slug,
      title: page.title,
      seoTitle: page.seoTitle ?? null,
      seoDescription: page.seoDescription ?? null,
    });

    const rows = page.sections.map((section, i) => {
      const entry = sectionRegistry[section.type];

      // The typed sec() helper checks this at compile time; this second check
      // catches a schema that changed after the seed data was written.
      const parsed = entry.schema.safeParse(section.data);
      if (!parsed.success) {
        throw new Error(
          `Seed section ${page.slug}#${i + 1} ("${section.type}") is invalid: ` +
            parsed.error.issues
              .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
              .join('; '),
        );
      }

      return {
        id: `${page.slug}-${String(i + 1).padStart(2, '0')}`,
        pageSlug: page.slug,
        type: section.type,
        order: (i + 1) * 10, // gaps, so a drag-reorder has room between rows
        visible: section.visible,
        data: sanitizeSectionData(parsed.data),
      };
    });

    await db.insert(schema.sections).values(rows);
    sectionCount += rows.length;
    console.log(
      `  ${pageLabels[page.slug].padEnd(28)} ${String(rows.length).padStart(2)} section(s)`,
    );
  }

  return { pages: seedPages.length, sections: sectionCount };
}

/**
 * Sanitize every rich-HTML field in a section's data before it is stored.
 *
 * Which fields are HTML is declared by the schema (`.describe('html')`), but
 * walking the parsed value is simpler and safer than walking the zod tree: any
 * string under a key named `html` or `*Html` is rich text by convention here.
 */
function sanitizeSectionData(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeSectionData);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, v]) => [
        key,
        key === 'html' && typeof v === 'string' ? sanitizeHtml(v) : sanitizeSectionData(v),
      ]),
    );
  }
  return value;
}

/* -------------------------------------------------------------------------- */

async function seedCollections() {
  await db.delete(schema.categories);
  await db.insert(schema.categories).values(
    mockCategories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: sanitizeHtml(c.description),
      image: c.image,
      featured: true,
      order: c.order,
      seoTitle: c.seo?.title ?? null,
      seoDescription: c.seo?.description ?? null,
    })),
  );

  await db.delete(schema.products);
  await db.insert(schema.products).values(
    mockProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      categorySlug: p.categorySlug,
      name: p.name,
      images: p.images,
      summary: p.summary,
      content: sanitizeHtml(p.content),
      specs: p.specs ?? null,
      order: p.order,
      seoTitle: p.seo?.title ?? null,
      seoDescription: p.seo?.description ?? null,
    })),
  );

  await db.delete(schema.news);
  await db.insert(schema.news).values(
    mockNews.map((n) => ({
      id: n.id,
      slug: n.slug,
      title: n.title,
      coverImage: n.coverImage,
      excerpt: n.excerpt,
      content: sanitizeHtml(n.content),
      publishedAt: new Date(n.publishedAt),
      seoTitle: n.seo?.title ?? null,
      seoDescription: n.seo?.description ?? null,
    })),
  );

  await db.delete(schema.galleryImages);
  await db.insert(schema.galleryImages).values(
    mockGallery.map((g, i) => ({
      id: g.id,
      src: g.src,
      caption: g.caption ?? null,
      album: g.album ?? null,
      order: (i + 1) * 10,
    })),
  );

  await db.delete(schema.videos);
  await db.insert(schema.videos).values(
    mockVideos.map((v, i) => ({
      id: v.id,
      title: v.title,
      youtubeId: v.youtubeId,
      publishedAt: v.publishedAt ? new Date(v.publishedAt) : new Date(),
      order: (i + 1) * 10,
    })),
  );

  await db.delete(schema.partners);
  await db.insert(schema.partners).values(
    mockPartners.map((p, i) => ({
      id: p.id,
      name: p.name,
      logo: p.logo,
      order: (i + 1) * 10,
    })),
  );

  await db.delete(schema.jobOpenings);
  await db.insert(schema.jobOpenings).values(
    mockJobs.map((j, i) => ({
      id: j.id,
      title: j.title,
      location: j.location,
      type: j.type,
      summary: j.summary,
      order: (i + 1) * 10,
    })),
  );

  return {
    categories: mockCategories.length,
    products: mockProducts.length,
    news: mockNews.length,
    gallery: mockGallery.length,
    videos: mockVideos.length,
    partners: mockPartners.length,
    jobs: mockJobs.length,
  };
}

/* -------------------------------------------------------------------------- */

async function seedSettings() {
  const social = (label: string) =>
    siteSettings.socials.find((s) => s.label === label)?.href ?? null;

  await db.delete(schema.settings);
  await db.insert(schema.settings).values({
    id: 1,
    companyName: siteSettings.companyName,
    logo: siteSettings.logo || null,
    logoTitle: 'Proactive',
    logoSubtitle: "Trade Int'l",
    footerTagline: siteSettings.footerTagline || null,
    favicon: siteSettings.favicon || null,
    qrCode: siteSettings.qrCode || null,
    qrCodeCaption: siteSettings.qrCodeCaption || null,
    phone: siteSettings.phone,
    whatsapp: siteSettings.whatsapp || null,
    email: siteSettings.email,
    address: siteSettings.address,
    mapQuery: siteSettings.mapQuery,
    mapEmbed: null,
    facebook: social('Facebook'),
    linkedin: social('LinkedIn'),
    instagram: social('Instagram'),
    youtube: social('YouTube'),
    seoGoogleVerification: siteSettings.seo.googleVerification || null,
    seoBingVerification: siteSettings.seo.bingVerification || null,
    seoGa4Id: siteSettings.seo.ga4Id || null,
    seoGtmId: siteSettings.seo.gtmId || null,
    seoMetaPixelId: siteSettings.seo.metaPixelId || null,
    seoFacebookDomainVerification: siteSettings.seo.facebookDomainVerification || null,
    seoYandexVerification: siteSettings.seo.yandexVerification || null,
    seoPinterestVerification: siteSettings.seo.pinterestVerification || null,
    seoAhrefsVerification: siteSettings.seo.ahrefsVerification || null,
    seoCustomHeadTags: siteSettings.seo.customHeadTags || null,
  });
}

async function seedAdmin() {
  const [existing] = await db
    .select()
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.email, ADMIN_EMAIL))
    .limit(1);

  if (existing) {
    console.log(`\nAdmin ${ADMIN_EMAIL} already exists — password left unchanged.`);
    return;
  }

  const { password, generated } = adminPassword();
  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(schema.adminUsers).values({
    id: 'admin-1',
    email: ADMIN_EMAIL,
    passwordHash,
    name: 'Administrator',
  });

  console.log('\n' + '='.repeat(58));
  console.log('  ADMIN USER CREATED');
  console.log(`  email:    ${ADMIN_EMAIL}`);
  console.log(`  password: ${password}`);
  if (generated) {
    console.log('  (generated — set ADMIN_PASSWORD in .env to choose your own)');
  }
  console.log('  Change it after first login. Never commit it.');
  console.log('='.repeat(58));
}

/* -------------------------------------------------------------------------- */

async function main() {
  console.log('Seeding pages & sections…');
  const pageStats = await seedPagesAndSections();

  console.log('\nSeeding collections…');
  const collections = await seedCollections();
  for (const [name, n] of Object.entries(collections)) {
    console.log(`  ${name.padEnd(28)} ${String(n).padStart(2)} row(s)`);
  }

  console.log('\nSeeding settings…');
  await seedSettings();

  await seedAdmin();

  console.log(
    `\nDone: ${pageStats.pages} pages, ${pageStats.sections} sections, ` +
      `${Object.values(collections).reduce((a, b) => a + b, 0)} collection rows.`,
  );
  console.log('Submissions in career_applications / contact_messages were not touched.');
}

main()
  .catch((error) => {
    console.error('\nSEED FAILED:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(close);
