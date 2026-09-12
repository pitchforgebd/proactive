'use server';

import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidateSettings, revalidateSitemap } from '@/lib/revalidate';
import { careerApplications, contactMessages, settings } from '@/lib/schema';
import { sanitizeCustomHeadTags } from '@/lib/seo/custom-head';
import { getPublicSitemapEntries } from '@/lib/seo/sitemap-source';
import { publicSitemapUrl, summarizeSitemapEntries } from '@/lib/seo/sitemap-summary';
import { absoluteUrl } from '@/lib/utils';

/** Settings + inbox actions. */

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Not authorised.');
}

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === '' || /^https?:\/\//i.test(v), 'Use a full https:// address.');

const optionalLogo = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => v === '' || v.startsWith('/'),
    'Upload a logo or use a site path starting with / (e.g. /api/files/… or /images/…).',
  );

/** Verification meta content tokens — letters, digits, and a few safe marks. */
const optionalVerification = z
  .string()
  .trim()
  .max(200)
  .refine(
    (v) => v === '' || /^[\w./:=+-]+$/i.test(v),
    'Use only the verification token (no HTML tags).',
  );

const optionalGa4 = z
  .string()
  .trim()
  .max(40)
  .refine((v) => v === '' || /^G-[A-Z0-9]+$/i.test(v), 'Use a GA4 ID like G-XXXXXXXX.');

const optionalGtm = z
  .string()
  .trim()
  .max(40)
  .refine((v) => v === '' || /^GTM-[A-Z0-9]+$/i.test(v), 'Use a GTM ID like GTM-XXXXXX.');

const optionalPixel = z
  .string()
  .trim()
  .max(40)
  .refine((v) => v === '' || /^\d{5,20}$/.test(v), 'Use the numeric Meta Pixel ID.');

const settingsInput = z.object({
  companyName: z.string().trim().min(1, 'The company name is required.').max(200),
  logo: optionalLogo,
  logoDark: optionalLogo,
  logoFooter: optionalLogo,
  logoTitle: z.string().trim().max(80),
  logoSubtitle: z.string().trim().max(80),
  footerTagline: z.string().trim().max(600),
  favicon: optionalLogo,
  qrCode: optionalLogo,
  qrCodeCaption: z.string().trim().max(120),
  phone: z.string().trim().max(40),
  whatsapp: z.string().trim().max(40),
  email: z.string().trim().email('That is not a valid email address.').max(200),
  address: z.string().trim().max(400),
  mapQuery: z.string().trim().max(400),
  facebook: optionalUrl,
  linkedin: optionalUrl,
  instagram: optionalUrl,
  youtube: optionalUrl,
  /* Verification & analytics — empty string clears the public head tag. */
  seoGoogleVerification: optionalVerification,
  seoBingVerification: optionalVerification,
  seoGa4Id: optionalGa4,
  seoGtmId: optionalGtm,
  seoMetaPixelId: optionalPixel,
  seoFacebookDomainVerification: optionalVerification,
  seoYandexVerification: optionalVerification,
  seoPinterestVerification: optionalVerification,
  seoAhrefsVerification: optionalVerification,
  seoCustomHeadTags: z
    .string()
    .trim()
    .max(10_000)
    .refine(
      (v) => {
        if (!v) return true;
        if (/<script\b/i.test(v)) return false;
        if (/\bon\w+\s*=/i.test(v)) return false;
        if (/javascript\s*:/i.test(v)) return false;
        return true;
      },
      'Custom head tags may only include meta/link markup — no scripts or event handlers.',
    ),
});

export interface SettingsResult {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

/**
 * Global settings feed the header, footer, contact page and every CTA band, so
 * a save revalidates the whole layout rather than one path.
 */
export async function saveSettings(rawJson: string): Promise<SettingsResult> {
  await requireAdmin();

  let input: unknown;
  try {
    input = JSON.parse(rawJson);
  } catch {
    return { ok: false, message: 'The form could not be read. Reload and try again.' };
  }

  const parsed = settingsInput.safeParse(input);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join('.')] = issue.message;
    return { ok: false, message: 'Some fields need attention.', errors };
  }

  const values = {
    ...parsed.data,
    seoCustomHeadTags: sanitizeCustomHeadTags(parsed.data.seoCustomHeadTags) || null,
    seoGoogleVerification: parsed.data.seoGoogleVerification || null,
    seoBingVerification: parsed.data.seoBingVerification || null,
    seoGa4Id: parsed.data.seoGa4Id || null,
    seoGtmId: parsed.data.seoGtmId || null,
    seoMetaPixelId: parsed.data.seoMetaPixelId || null,
    seoFacebookDomainVerification: parsed.data.seoFacebookDomainVerification || null,
    seoYandexVerification: parsed.data.seoYandexVerification || null,
    seoPinterestVerification: parsed.data.seoPinterestVerification || null,
    seoAhrefsVerification: parsed.data.seoAhrefsVerification || null,
    logo: parsed.data.logo || null,
    logoDark: parsed.data.logoDark || null,
    logoFooter: parsed.data.logoFooter || null,
    logoTitle: parsed.data.logoTitle || null,
    logoSubtitle: parsed.data.logoSubtitle || null,
    footerTagline: parsed.data.footerTagline || null,
    favicon: parsed.data.favicon || null,
    qrCode: parsed.data.qrCode || null,
    qrCodeCaption: parsed.data.qrCodeCaption || null,
    whatsapp: parsed.data.whatsapp || null,
    facebook: parsed.data.facebook || null,
    linkedin: parsed.data.linkedin || null,
    instagram: parsed.data.instagram || null,
    youtube: parsed.data.youtube || null,
  };
  const [existing] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);

  if (existing) {
    await db.update(settings).set(values).where(eq(settings.id, 1));
  } else {
    await db.insert(settings).values({ id: 1, ...values });
  }

  revalidateSettings();
  revalidatePath('/admin/settings');

  return {
    ok: true,
    message: 'Saved. Verification tags and analytics update on the public site.',
  };
}

export interface SitemapRefreshResult {
  ok: boolean;
  message: string;
  sitemapUrl?: string;
  urlCount?: number;
  newestLastModified?: string | null;
  refreshedAt?: string;
  breakdown?: ReturnType<typeof summarizeSitemapEntries>;
}

/**
 * Refresh the dynamic public sitemap cache (no physical file is written).
 * Revalidates `/sitemap.xml` and returns the live URL count from the same
 * assembler used by the public route.
 */
export async function refreshSitemap(): Promise<SitemapRefreshResult> {
  await requireAdmin();

  try {
    revalidateSitemap();
    revalidatePath('/admin/settings/sitemap');

    const entries = await getPublicSitemapEntries();
    const breakdown = summarizeSitemapEntries(entries);
    const refreshedAt = new Date().toISOString();

    return {
      ok: true,
      message:
        'Sitemap cache refreshed. /sitemap.xml will rebuild from the database on the next request (no physical file).',
      sitemapUrl: publicSitemapUrl(),
      urlCount: breakdown.total,
      newestLastModified: breakdown.newestLastModified,
      refreshedAt,
      breakdown,
    };
  } catch (err) {
    console.error('[sitemap] refresh failed', err);
    return {
      ok: false,
      message: 'Could not refresh the sitemap cache. Check the server log and try again.',
      sitemapUrl: absoluteUrl('/sitemap.xml'),
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Inboxes                                                                     */
/* -------------------------------------------------------------------------- */

export async function markRead(kind: 'career' | 'contact', id: string, read: boolean) {
  await requireAdmin();
  const table = kind === 'career' ? careerApplications : contactMessages;
  await db.update(table).set({ read }).where(eq(table.id, id));
  revalidatePath(`/admin/${kind}`);
}

export async function deleteSubmission(kind: 'career' | 'contact', id: string) {
  await requireAdmin();
  const table = kind === 'career' ? careerApplications : contactMessages;
  await db.delete(table).where(eq(table.id, id));
  revalidatePath(`/admin/${kind}`);
}

/** Newest first — an inbox is read from the top. */
export async function listSubmissions(kind: 'career' | 'contact') {
  await requireAdmin();
  return kind === 'career'
    ? db.select().from(careerApplications).orderBy(desc(careerApplications.createdAt))
    : db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}
