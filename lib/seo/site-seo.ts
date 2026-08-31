/**
 * Build Next.js Metadata fragments from Settings.seo.
 * Empty fields are omitted so clearing a value in admin removes the tag.
 */
import type { Metadata } from 'next';

import type { SiteSeoSettings } from '@/lib/types';

import { extractCustomMetaPairs } from './custom-head';

/** Re-check IDs at render time — never trust a stale/imported row blindly. */
export function isGa4Id(value: string): boolean {
  return /^G-[A-Z0-9]+$/i.test(value.trim());
}

export function isGtmId(value: string): boolean {
  return /^GTM-[A-Z0-9]+$/i.test(value.trim());
}

export function isMetaPixelId(value: string): boolean {
  return /^\d{5,20}$/.test(value.trim());
}

export function isVerificationToken(value: string): boolean {
  return /^[\w./:=+-]+$/i.test(value.trim()) && value.trim().length <= 200;
}

export function buildSiteSeoMetadata(seo: SiteSeoSettings): Metadata {
  const verification: NonNullable<Metadata['verification']> = {};
  const other: Record<string, string> = {};

  const google = seo.googleVerification.trim();
  if (google && isVerificationToken(google)) verification.google = google;

  const yandex = seo.yandexVerification.trim();
  if (yandex && isVerificationToken(yandex)) verification.yandex = yandex;

  const bing = seo.bingVerification.trim();
  if (bing && isVerificationToken(bing)) other['msvalidate.01'] = bing;

  const facebook = seo.facebookDomainVerification.trim();
  if (facebook && isVerificationToken(facebook)) {
    other['facebook-domain-verification'] = facebook;
  }

  const pinterest = seo.pinterestVerification.trim();
  if (pinterest && isVerificationToken(pinterest)) {
    other['pinterest-site-verification'] = pinterest;
  }

  const ahrefs = seo.ahrefsVerification.trim();
  if (ahrefs && isVerificationToken(ahrefs)) {
    other['ahrefs-site-verification'] = ahrefs;
  }

  const reservedNames = new Set([
    'google-site-verification',
    'yandex-verification',
    'msvalidate.01',
    'facebook-domain-verification',
    'pinterest-site-verification',
    'ahrefs-site-verification',
  ]);

  for (const { name, content } of extractCustomMetaPairs(seo.customHeadTags)) {
    if (reservedNames.has(name) || other[name]) continue;
    if (/^on/i.test(name) || /script/i.test(name)) continue;
    other[name] = content;
  }

  const metadata: Metadata = {};
  if (verification.google || verification.yandex || Object.keys(other).length) {
    metadata.verification = {
      ...verification,
      ...(Object.keys(other).length ? { other } : {}),
    };
  }
  return metadata;
}
