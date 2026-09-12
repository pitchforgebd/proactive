/**
 * Shared content models. These are the contract the Phase 2 dashboard/API must
 * satisfy — see lib/data/index.ts for the function signatures built on them.
 */

export interface Seo {
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  /** Rich HTML (Summernote output later) — render through <RichText />. */
  description: string;
  image: string;
  /** Home “What We Offer” grid when true. */
  featured?: boolean;
  order: number;
  seo?: Seo;
  /** ISO 8601 — used by sitemap lastModified when present. */
  createdAt?: string;
}

export interface Product {
  id: string;
  slug: string;
  categorySlug: string;
  name: string;
  images: string[];
  summary: string;
  /** Rich HTML — render through <RichText />. */
  content: string;
  specs?: { label: string; value: string }[];
  order: number;
  seo?: Seo;
  /** ISO 8601 — used by sitemap lastModified when present. */
  createdAt?: string;
}

export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  excerpt: string;
  /** Rich HTML — render through <RichText />. */
  content: string;
  /** ISO 8601 date string. */
  publishedAt: string;
  seo?: Seo;
}

export interface GalleryImage {
  id: string;
  src: string;
  caption?: string;
  album?: string;
}

export interface Video {
  id: string;
  title: string;
  youtubeId: string;
  publishedAt?: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
}

export interface JobOpening {
  id: string;
  title: string;
  location: string;
  type: string;
  summary: string;
}

export interface CareerApplication {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  coverLetter: string;
  resumeUrl: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/* -------------------------------------------------------------------------- */
/* Dynamic pages & sections                                                    */
/* -------------------------------------------------------------------------- */

/** A dashboard-managed page. Its body is an ordered list of sections. */
export interface Page {
  slug: string;
  title: string;
  seo?: Seo;
  /** ISO 8601. */
  updatedAt?: string;
}

/**
 * One section instance on a page.
 *
 * `type` names an entry in lib/sections/registry.ts (the coded component and
 * its design); `data` is the editable content for that type. `data` is
 * deliberately `unknown` — it is only trusted after the registry's zod schema
 * has parsed it in SectionRenderer.
 */
export interface PageSection {
  id: string;
  pageSlug: string;
  type: string;
  order: number;
  visible: boolean;
  data: unknown;
}

export interface PageWithSections {
  page: Page;
  sections: PageSection[];
}

/** Editable-from-dashboard globals (contact block, socials, map, logo, SEO). */
export interface SiteSettings {
  companyName: string;
  /** Header logo, LIGHT theme. Empty → coded SVG wordmark fallback. */
  logo: string;
  /** Header logo, DARK theme. Empty → `logo` is used in both themes. */
  logoDark: string;
  /** Footer logo (one image, both themes). Empty → falls back to `logo`. */
  logoFooter: string;
  /** Wordmark primary line when `logo` is empty. Default “Proactive”. */
  logoTitle: string;
  /** Wordmark secondary line when `logo` is empty. Default “Trade Int'l”. */
  logoSubtitle: string;
  /**
   * Plain-text blurb under the footer logo. Empty → default marketing line.
   */
  footerTagline: string;
  /** Empty string → no custom favicon in public `<head>`. */
  favicon: string;
  /** Empty string → footer omits the QR block. */
  qrCode: string;
  /** Optional caption under the footer QR. */
  qrCodeCaption: string;
  phone: string;
  /**
   * WhatsApp number for the floating button. Empty → button hidden.
   * Display/form value; public link uses digits only.
   */
  whatsapp: string;
  email: string;
  address: string;
  mapQuery: string;
  socials: { label: string; href: string }[];
  /**
   * SEO / analytics IDs and verification tokens (Settings → Verification & Head Tags).
   * Empty strings omit the corresponding public `<head>` tags / scripts.
   */
  seo: SiteSeoSettings;
}

/** Flat SEO fields kept on Settings (same row — no extra table). */
export interface SiteSeoSettings {
  googleVerification: string;
  bingVerification: string;
  ga4Id: string;
  gtmId: string;
  metaPixelId: string;
  facebookDomainVerification: string;
  yandexVerification: string;
  pinterestVerification: string;
  ahrefsVerification: string;
  /** Allowlisted meta/link HTML only — sanitized on save and when extracted for head. */
  customHeadTags: string;
}

export const emptySiteSeo = (): SiteSeoSettings => ({
  googleVerification: '',
  bingVerification: '',
  ga4Id: '',
  gtmId: '',
  metaPixelId: '',
  facebookDomainVerification: '',
  yandexVerification: '',
  pinterestVerification: '',
  ahrefsVerification: '',
  customHeadTags: '',
});
