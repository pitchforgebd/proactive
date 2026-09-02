/**
 * DATABASE IMPLEMENTATION of the public data API.
 *
 * Reads run in Server Components and go straight to MySQL through Drizzle —
 * no internal HTTP hop (PHASE2-BACKEND.md §2). Writes never happen here; they
 * live in the dashboard's Server Actions and route handlers.
 *
 * Every function exported from lib/data/index.ts has a counterpart here with
 * the same name, arguments and return type, so the swap is a one-line change
 * and no component has to know where content comes from.
 *
 * CACHING
 *   React `cache()` dedupes a call within a single render — getSiteSettings()
 *   is read by the header, the footer and most pages, and should hit the
 *   database once per request, not six times. Across requests, freshness is
 *   handled by ISR (`export const revalidate = 60`) plus revalidatePath() on
 *   every dashboard write.
 *
 * NULLS
 *   Nullable columns are normalised to the non-null shapes lib/types.ts
 *   promises ('' or []), so no component needs a null check it did not need in
 *   Phase 1.
 */
import 'server-only';

import { cache } from 'react';
import { and, asc, desc, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import {
  categories as categoriesTable,
  galleryImages as galleryTable,
  jobOpenings as jobsTable,
  news as newsTable,
  pages as pagesTable,
  partners as partnersTable,
  products as productsTable,
  sections as sectionsTable,
  settings as settingsTable,
  videos as videosTable,
  type CategoryRow,
  type GalleryImageRow,
  type JobOpeningRow,
  type NewsRow,
  type PageRow,
  type PartnerRow,
  type ProductRow,
  type SectionRow,
  type VideoRow,
} from '@/lib/schema';
import type {
  Category,
  GalleryImage,
  JobOpening,
  NewsPost,
  Page,
  PageSection,
  PageWithSections,
  Partner,
  Product,
  Seo,
  SiteSettings,
  Video,
} from '@/lib/types';
import { emptySiteSeo } from '@/lib/types';
import { sanitizeCustomHeadTags } from '@/lib/seo/custom-head';

const DEFAULT_FOOTER_TAGLINE =
  'One-stop printing & packaging solutions — machineries, press room chemicals, inks, coatings and consumables, backed by dedicated technical support across Bangladesh.';

/* -------------------------------------------------------------------------- */
/* Row → type mapping                                                          */
/* -------------------------------------------------------------------------- */

/** Drop an all-empty SEO object rather than handing components a hollow one. */
function toSeo(
  title: string | null,
  description: string | null,
  ogImage: string | null = null,
): Seo | undefined {
  if (!title && !description && !ogImage) return undefined;
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(ogImage ? { ogImage } : {}),
  };
}

/** mysql2 returns DATETIME as a Date; the content types promise ISO strings. */
function toIso(value: Date | string | null): string {
  if (!value) return new Date(0).toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/** JSON columns are `unknown` until proven otherwise — never trust the shape. */
function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

function toSpecs(value: unknown): { label: string; value: string }[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const specs = value.filter(
    (s): s is { label: string; value: string } =>
      Boolean(s) &&
      typeof s === 'object' &&
      typeof (s as { label?: unknown }).label === 'string' &&
      typeof (s as { value?: unknown }).value === 'string',
  );
  return specs.length > 0 ? specs : undefined;
}

function mapCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? '',
    image: r.image ?? '',
    order: r.order ?? 0,
    seo: toSeo(r.seoTitle, r.seoDescription),
    createdAt: r.createdAt ? toIso(r.createdAt) : undefined,
  };
}

function mapProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    categorySlug: r.categorySlug,
    name: r.name,
    images: toStringArray(r.images),
    summary: r.summary ?? '',
    content: r.content ?? '',
    specs: toSpecs(r.specs),
    featured: Boolean(r.featured),
    order: r.order ?? 0,
    seo: toSeo(r.seoTitle, r.seoDescription),
    createdAt: r.createdAt ? toIso(r.createdAt) : undefined,
  };
}

function mapNews(r: NewsRow): NewsPost {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    coverImage: r.coverImage ?? '',
    excerpt: r.excerpt ?? '',
    content: r.content ?? '',
    publishedAt: toIso(r.publishedAt),
    seo: toSeo(r.seoTitle, r.seoDescription),
  };
}

function mapGalleryImage(r: GalleryImageRow): GalleryImage {
  return {
    id: r.id,
    src: r.src,
    ...(r.caption ? { caption: r.caption } : {}),
    ...(r.album ? { album: r.album } : {}),
  };
}

function mapVideo(r: VideoRow): Video {
  return {
    id: r.id,
    title: r.title,
    youtubeId: r.youtubeId,
    publishedAt: toIso(r.publishedAt),
  };
}

function mapPartner(r: PartnerRow): Partner {
  return { id: r.id, name: r.name, logo: r.logo };
}

function mapJobOpening(r: JobOpeningRow): JobOpening {
  return {
    id: r.id,
    title: r.title,
    location: r.location ?? '',
    type: r.type ?? '',
    summary: r.summary ?? '',
  };
}

function mapPage(r: PageRow): Page {
  return {
    slug: r.slug,
    title: r.title,
    seo: toSeo(r.seoTitle, r.seoDescription, r.ogImage),
    updatedAt: r.updatedAt ? toIso(r.updatedAt) : undefined,
  };
}

function mapSection(r: SectionRow): PageSection {
  return {
    id: r.id,
    pageSlug: r.pageSlug,
    type: r.type,
    order: r.order,
    visible: Boolean(r.visible),
    // Stays `unknown` on purpose — SectionRenderer parses it with the
    // registry's zod schema before any component sees it.
    data: r.data,
  };
}

/* -------------------------------------------------------------------------- */
/* Pages & sections                                                            */
/* -------------------------------------------------------------------------- */

/**
 * A page with its sections, ordered and filtered to visible ones.
 *
 * `includeHidden` is for the dashboard, which must show hidden sections so they
 * can be toggled back on. The public site never passes it.
 */
export const getPage = cache(
  async (slug: string, includeHidden = false): Promise<PageWithSections | null> => {
    const [pageRow] = await db
      .select()
      .from(pagesTable)
      .where(eq(pagesTable.slug, slug))
      .limit(1);

    if (!pageRow) return null;

    const rows = await db
      .select()
      .from(sectionsTable)
      .where(eq(sectionsTable.pageSlug, slug))
      .orderBy(asc(sectionsTable.order));

    const sections = rows
      .map(mapSection)
      .filter((s) => includeHidden || s.visible);

    return { page: mapPage(pageRow), sections };
  },
);

/** Every page slug — used by the dashboard's page list and by sitemap builds. */
export const getAllPageSlugs = cache(async (): Promise<string[]> => {
  const rows = await db.select({ slug: pagesTable.slug }).from(pagesTable);
  return rows.map((r) => r.slug);
});

/** Page record without its sections — enough for generateMetadata(). */
export const getPageMeta = cache(async (slug: string): Promise<Page | null> => {
  const [row] = await db
    .select()
    .from(pagesTable)
    .where(eq(pagesTable.slug, slug))
    .limit(1);
  return row ? mapPage(row) : null;
});

/* -------------------------------------------------------------------------- */
/* Categories                                                                  */
/* -------------------------------------------------------------------------- */

export const getCategories = cache(async (): Promise<Category[]> => {
  const rows = await db
    .select()
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.order));
  return rows.map(mapCategory);
});

export const getCategory = cache(async (slug: string): Promise<Category | null> => {
  const [row] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, slug))
    .limit(1);
  return row ? mapCategory(row) : null;
});

/* -------------------------------------------------------------------------- */
/* Products                                                                    */
/* -------------------------------------------------------------------------- */

export const getProducts = cache(async (): Promise<Product[]> => {
  const rows = await db.select().from(productsTable).orderBy(asc(productsTable.order));
  return rows.map(mapProduct);
});

/** Home “What We Offer” — featured products, capped (default 8). */
export const getFeaturedProducts = cache(async (limit = 8): Promise<Product[]> => {
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.featured, true))
    .orderBy(asc(productsTable.order))
    .limit(limit);
  return rows.map(mapProduct);
});

export const getProductsByCategory = cache(
  async (categorySlug: string): Promise<Product[]> => {
    const rows = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.categorySlug, categorySlug))
      .orderBy(asc(productsTable.order));
    return rows.map(mapProduct);
  },
);

export const getProduct = cache(
  async (categorySlug: string, productSlug: string): Promise<Product | null> => {
    const [row] = await db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.categorySlug, categorySlug),
          eq(productsTable.slug, productSlug),
        ),
      )
      .limit(1);
    return row ? mapProduct(row) : null;
  },
);

/* -------------------------------------------------------------------------- */
/* News                                                                        */
/* -------------------------------------------------------------------------- */

export const getNews = cache(async (): Promise<NewsPost[]> => {
  const rows = await db.select().from(newsTable).orderBy(desc(newsTable.publishedAt));
  return rows.map(mapNews);
});

export const getNewsPost = cache(async (slug: string): Promise<NewsPost | null> => {
  const [row] = await db
    .select()
    .from(newsTable)
    .where(eq(newsTable.slug, slug))
    .limit(1);
  return row ? mapNews(row) : null;
});

/* -------------------------------------------------------------------------- */
/* Media                                                                       */
/* -------------------------------------------------------------------------- */

export const getGalleryImages = cache(async (): Promise<GalleryImage[]> => {
  const rows = await db.select().from(galleryTable).orderBy(asc(galleryTable.order));
  return rows.map(mapGalleryImage);
});

export const getVideos = cache(async (): Promise<Video[]> => {
  const rows = await db.select().from(videosTable).orderBy(asc(videosTable.order));
  return rows.map(mapVideo);
});

export const getPartners = cache(async (): Promise<Partner[]> => {
  const rows = await db.select().from(partnersTable).orderBy(asc(partnersTable.order));
  return rows.map(mapPartner);
});

/* -------------------------------------------------------------------------- */
/* Settings & careers                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Global settings (row id = 1).
 *
 * If the row is missing the site still renders — an empty contact block is
 * recoverable, a crashed header is not — but it warns loudly, because the only
 * way to get here is an unseeded database.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const [row] = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.id, 1))
    .limit(1);

  if (!row) {
    console.warn(
      '[data] settings row (id=1) is missing — run `npm run db:seed`. ' +
        'Falling back to empty contact details.',
    );
    return {
      companyName: 'Proactive Trade International',
      logo: '',
      logoTitle: 'Proactive',
      logoSubtitle: "Trade Int'l",
      footerTagline: DEFAULT_FOOTER_TAGLINE,
      favicon: '',
      qrCode: '',
      qrCodeCaption: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      mapQuery: '',
      socials: [],
      seo: emptySiteSeo(),
    };
  }

  // Socials are four fixed columns in the settings row; empty ones are omitted
  // so the footer and contact page never render a link to nowhere.
  const socials: SiteSettings['socials'] = [];
  const addSocial = (label: string, href: string | null) => {
    if (href && href.trim()) socials.push({ label, href: href.trim() });
  };
  addSocial('Facebook', row.facebook);
  addSocial('LinkedIn', row.linkedin);
  addSocial('Instagram', row.instagram);
  addSocial('YouTube', row.youtube);

  return {
    companyName: row.companyName ?? 'Proactive Trade International',
    logo: row.logo?.trim() ?? '',
    logoTitle: row.logoTitle?.trim() || 'Proactive',
    logoSubtitle: row.logoSubtitle?.trim() || "Trade Int'l",
    footerTagline: row.footerTagline?.trim() || DEFAULT_FOOTER_TAGLINE,
    favicon: row.favicon?.trim() ?? '',
    qrCode: row.qrCode?.trim() ?? '',
    qrCodeCaption: row.qrCodeCaption?.trim() ?? '',
    phone: row.phone ?? '',
    whatsapp: row.whatsapp?.trim() ?? '',
    email: row.email ?? '',
    address: row.address ?? '',
    mapQuery: row.mapQuery ?? row.address ?? '',
    socials,
    seo: {
      googleVerification: row.seoGoogleVerification?.trim() ?? '',
      bingVerification: row.seoBingVerification?.trim() ?? '',
      ga4Id: row.seoGa4Id?.trim() ?? '',
      gtmId: row.seoGtmId?.trim() ?? '',
      metaPixelId: row.seoMetaPixelId?.trim() ?? '',
      facebookDomainVerification: row.seoFacebookDomainVerification?.trim() ?? '',
      yandexVerification: row.seoYandexVerification?.trim() ?? '',
      pinterestVerification: row.seoPinterestVerification?.trim() ?? '',
      ahrefsVerification: row.seoAhrefsVerification?.trim() ?? '',
      customHeadTags: sanitizeCustomHeadTags(row.seoCustomHeadTags ?? ''),
    },
  };
});

export const getJobOpenings = cache(async (): Promise<JobOpening[]> => {
  const rows = await db.select().from(jobsTable).orderBy(asc(jobsTable.order));
  return rows.map(mapJobOpening);
});
