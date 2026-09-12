/**
 * DRIZZLE SCHEMA — MySQL (PHASE2-BACKEND.md §5)
 *
 * Two families of tables:
 *
 *  1. The dynamic-page engine — `pages` + `sections`. A page is an ordered list
 *     of sections; each section has a `type` (a coded component whose design is
 *     fixed) and a `data` JSON blob (the editable content). Design in code,
 *     content in the database. See lib/sections/registry.ts for the catalog of
 *     allowed types.
 *
 *  2. Collections — categories, products, news, gallery, videos, partners, job
 *     openings — plus the form inboxes, global settings and admin users.
 *
 * Column shapes mirror lib/types.ts so the row → type mapping in
 * lib/data/remote.ts stays mechanical. Rich-HTML columns are `longtext` and are
 * sanitized on save AND on render.
 */
import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  int,
  json,
  longtext,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/mysql-core';

/* -------------------------------------------------------------------------- */
/* 1. Pages & sections — the dynamic-page engine                               */
/* -------------------------------------------------------------------------- */

export const pages = mysqlTable('pages', {
  /** 'home' | 'about' | 'vision-mission' … — maps to a route via pagePathMap. */
  slug: varchar('slug', { length: 160 }).primaryKey(),
  title: varchar('title', { length: 250 }).notNull(),
  seoTitle: varchar('seo_title', { length: 200 }),
  seoDescription: varchar('seo_description', { length: 320 }),
  ogImage: varchar('og_image', { length: 500 }),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const sections = mysqlTable(
  'sections',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    /** FK → pages.slug (enforced in application code, not by a DB constraint). */
    pageSlug: varchar('page_slug', { length: 160 }).notNull(),
    /** Must exist in sectionRegistry; unknown types render as nothing. */
    type: varchar('type', { length: 60 }).notNull(),
    order: int('order').notNull().default(0),
    visible: boolean('visible').notNull().default(true),
    /** Content for this section type, validated against the registry zod schema. */
    data: json('data').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  },
  (t) => [index('sections_page_slug_idx').on(t.pageSlug)],
);

export const pagesRelations = relations(pages, ({ many }) => ({
  sections: many(sections),
}));

export const sectionsRelations = relations(sections, ({ one }) => ({
  page: one(pages, { fields: [sections.pageSlug], references: [pages.slug] }),
}));

/* -------------------------------------------------------------------------- */
/* 2. Collections                                                              */
/* -------------------------------------------------------------------------- */

export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  /** Rich HTML. */
  description: longtext('description'),
  image: varchar('image', { length: 500 }),
  /**
   * When true, eligible for the home “What We Offer” grid.
   * Editors toggle this in Admin → Categories.
   */
  featured: boolean('featured').notNull().default(false),
  order: int('order').default(0),
  seoTitle: varchar('seo_title', { length: 200 }),
  seoDescription: varchar('seo_description', { length: 320 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = mysqlTable(
  'products',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    slug: varchar('slug', { length: 160 }).notNull(),
    categorySlug: varchar('category_slug', { length: 160 }).notNull(),
    name: varchar('name', { length: 250 }).notNull(),
    /** string[] */
    images: json('images'),
    summary: text('summary'),
    /** Rich HTML (Summernote). */
    content: longtext('content'),
    /** { label, value }[] */
    specs: json('specs'),
    order: int('order').default(0),
    seoTitle: varchar('seo_title', { length: 200 }),
    seoDescription: varchar('seo_description', { length: 320 }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [
    index('products_category_slug_idx').on(t.categorySlug),
    unique('products_category_slug_slug_unq').on(t.categorySlug, t.slug),
  ],
);

export const news = mysqlTable('news', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  title: varchar('title', { length: 300 }).notNull(),
  coverImage: varchar('cover_image', { length: 500 }),
  excerpt: text('excerpt'),
  /** Rich HTML. */
  content: longtext('content'),
  publishedAt: timestamp('published_at').defaultNow(),
  seoTitle: varchar('seo_title', { length: 200 }),
  seoDescription: varchar('seo_description', { length: 320 }),
});

export const galleryImages = mysqlTable('gallery_images', {
  id: varchar('id', { length: 36 }).primaryKey(),
  src: varchar('src', { length: 500 }).notNull(),
  caption: varchar('caption', { length: 300 }),
  album: varchar('album', { length: 160 }),
  order: int('order').default(0),
});

export const videos = mysqlTable('videos', {
  id: varchar('id', { length: 36 }).primaryKey(),
  title: varchar('title', { length: 300 }).notNull(),
  youtubeId: varchar('youtube_id', { length: 40 }).notNull(),
  publishedAt: timestamp('published_at').defaultNow(),
  order: int('order').default(0),
});

/**
 * Partner logos. Not in PHASE2-BACKEND.md §5, but lib/data already exposes
 * getPartners() and the home marquee reads it — remote.ts must implement every
 * existing signature, so the collection needs a table.
 */
export const partners = mysqlTable('partners', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  logo: varchar('logo', { length: 500 }).notNull(),
  order: int('order').default(0),
});

/** Openings listed above the career form. An empty table is a valid state. */
export const jobOpenings = mysqlTable('job_openings', {
  id: varchar('id', { length: 36 }).primaryKey(),
  title: varchar('title', { length: 250 }).notNull(),
  location: varchar('location', { length: 200 }),
  type: varchar('type', { length: 80 }),
  summary: text('summary'),
  order: int('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* 3. Form inboxes                                                             */
/* -------------------------------------------------------------------------- */

export const careerApplications = mysqlTable('career_applications', {
  id: varchar('id', { length: 36 }).primaryKey(),
  fullName: varchar('full_name', { length: 200 }).notNull(),
  email: varchar('email', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 40 }),
  position: varchar('position', { length: 200 }),
  coverLetter: text('cover_letter'),
  /** Relative path served by /api/files/[...path] — never a public/ path. */
  resumeUrl: varchar('resume_url', { length: 500 }),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const contactMessages = mysqlTable('contact_messages', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 40 }),
  subject: varchar('subject', { length: 250 }),
  message: text('message').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* 4. Globals & auth                                                           */
/* -------------------------------------------------------------------------- */

/** Single row (id = 1). Drives the header/footer contact block and socials. */
export const settings = mysqlTable('settings', {
  id: int('id').primaryKey().default(1),
  companyName: varchar('company_name', { length: 200 }),
  /**
   * Header logo for the LIGHT theme (/images/… or /api/files/images/…).
   * Empty/null → the coded SVG wordmark fallback in components/layout/Logo.tsx.
   */
  logo: varchar('logo', { length: 500 }),
  /**
   * Header logo for the DARK theme. Empty/null → `logo` is used in both
   * themes, so a single-logo site needs no second upload.
   */
  logoDark: varchar('logo_dark', { length: 500 }),
  /**
   * Footer logo — one image, used in both themes (the footer sits on a navy
   * band that does not flip with the theme). Empty/null → falls back to `logo`.
   */
  logoFooter: varchar('logo_footer', { length: 500 }),
  /**
   * Wordmark primary line when no logo image is set (header / footer / drawer).
   * Empty → “Proactive”.
   */
  logoTitle: varchar('logo_title', { length: 80 }),
  /**
   * Wordmark secondary line. Empty → “Trade Int'l”.
   */
  logoSubtitle: varchar('logo_subtitle', { length: 80 }),
  /**
   * Short blurb under the footer logo. Empty → coded default copy.
   */
  footerTagline: text('footer_tagline'),
  /**
   * Optional favicon URL (/images/… or /api/files/images/…). Empty → browser
   * default / no custom icon in public metadata.
   */
  favicon: varchar('favicon', { length: 500 }),
  /**
   * Optional footer QR image (/images/… or /api/files/images/…). Empty → no QR.
   */
  qrCode: varchar('qr_code', { length: 500 }),
  /** Optional caption under the footer QR (e.g. “Scan for WhatsApp”). */
  qrCodeCaption: varchar('qr_code_caption', { length: 120 }),
  phone: varchar('phone', { length: 40 }),
  /**
   * WhatsApp number for the floating chat button (digits / + / spaces).
   * Empty → button is hidden on the public site.
   */
  whatsapp: varchar('whatsapp', { length: 40 }),
  email: varchar('email', { length: 200 }),
  address: varchar('address', { length: 400 }),
  /** Plain-text query the lazy map facade geocodes (SiteSettings.mapQuery). */
  mapQuery: varchar('map_query', { length: 400 }),
  /** Optional full iframe/embed override. */
  mapEmbed: text('map_embed'),
  facebook: varchar('facebook', { length: 300 }),
  linkedin: varchar('linkedin', { length: 300 }),
  instagram: varchar('instagram', { length: 300 }),
  youtube: varchar('youtube', { length: 300 }),
  /* ---- SEO / analytics (stored only in Phase 7; public head comes later) ---- */
  /** Google Search Console meta verification content token. */
  seoGoogleVerification: varchar('seo_google_verification', { length: 200 }),
  /** Bing Webmaster Tools meta verification content. */
  seoBingVerification: varchar('seo_bing_verification', { length: 200 }),
  /** GA4 Measurement ID, e.g. G-XXXXXXXX. */
  seoGa4Id: varchar('seo_ga4_id', { length: 40 }),
  /** Google Tag Manager container, e.g. GTM-XXXXXX. */
  seoGtmId: varchar('seo_gtm_id', { length: 40 }),
  /** Meta (Facebook) Pixel ID — digits only. */
  seoMetaPixelId: varchar('seo_meta_pixel_id', { length: 40 }),
  /** Facebook domain verification meta content. */
  seoFacebookDomainVerification: varchar('seo_facebook_domain_verification', { length: 200 }),
  seoYandexVerification: varchar('seo_yandex_verification', { length: 200 }),
  seoPinterestVerification: varchar('seo_pinterest_verification', { length: 200 }),
  seoAhrefsVerification: varchar('seo_ahrefs_verification', { length: 200 }),
  /**
   * Optional raw head snippets for a later public renderer. Never execute in
   * the dashboard; sanitise/allowlist before any public inject.
   */
  seoCustomHeadTags: text('seo_custom_head_tags'),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const adminUsers = mysqlTable('admin_users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 200 }).notNull().unique(),
  /** bcrypt hash — never plaintext, never sent to the client. */
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 160 }),
  createdAt: timestamp('created_at').defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Row types                                                                   */
/* -------------------------------------------------------------------------- */

export type PageRow = typeof pages.$inferSelect;
export type SectionRow = typeof sections.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type ProductRow = typeof products.$inferSelect;
export type NewsRow = typeof news.$inferSelect;
export type GalleryImageRow = typeof galleryImages.$inferSelect;
export type VideoRow = typeof videos.$inferSelect;
export type PartnerRow = typeof partners.$inferSelect;
export type JobOpeningRow = typeof jobOpenings.$inferSelect;
export type CareerApplicationRow = typeof careerApplications.$inferSelect;
export type ContactMessageRow = typeof contactMessages.$inferSelect;
export type SettingsRow = typeof settings.$inferSelect;
export type AdminUserRow = typeof adminUsers.$inferSelect;
