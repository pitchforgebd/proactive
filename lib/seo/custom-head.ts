/**
 * Allowlisted sanitizer for Settings → custom head tags.
 *
 * Only <meta> and <link> survive. No <script>, event handlers, javascript:
 * URLs, or data: URLs — those belong in dedicated GA4/GTM/Pixel fields.
 */
import DOMPurify from 'isomorphic-dompurify';
import type { Config } from 'dompurify';

const CUSTOM_HEAD_CONFIG: Config = {
  // Meta/link are head-only; without WHOLE_DOCUMENT jsdom drops them from fragments.
  WHOLE_DOCUMENT: true,
  ALLOWED_TAGS: ['html', 'head', 'body', 'meta', 'link'],
  ALLOWED_ATTR: [
    'name',
    'content',
    'property',
    'http-equiv',
    'charset',
    'rel',
    'href',
    'type',
    'sizes',
    'media',
    'crossorigin',
    'hreflang',
  ],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style', 'base', 'form', 'img', 'svg'],
  FORBID_ATTR: ['style', 'src', 'srcset', 'onerror', 'onload', 'onclick', 'onmouseover'],
};

const UNSAFE_HREF = /^(javascript|data|vbscript):/i;

function unwrapDocumentShell(html: string): string {
  return html
    .replace(/^<html[^>]*>/i, '')
    .replace(/<\/html>$/i, '')
    .replace(/^<head[^>]*>/i, '')
    .replace(/<\/head>/i, '')
    .replace(/<body[^>]*>[\s\S]*?<\/body>/i, '')
    .trim();
}

export function sanitizeCustomHeadTags(html: string | null | undefined): string {
  if (!html || !html.trim()) return '';

  const cleaned = unwrapDocumentShell(DOMPurify.sanitize(html, CUSTOM_HEAD_CONFIG));
  if (!cleaned) return '';

  // Strip any remaining javascript:/data: hrefs (DOMPurify usually does this;
  // belt-and-braces for link tags).
  return cleaned.replace(
    /\shref\s*=\s*(["'])([^"']*)\1/gi,
    (match, quote: string, href: string) =>
      UNSAFE_HREF.test(href.trim()) ? '' : ` href=${quote}${href}${quote}`,
  );
}

export interface HeadMetaPair {
  name: string;
  content: string;
}

/**
 * Pull name/content (or property/content) pairs from sanitized custom head HTML
 * so they can be merged into Next.js Metadata `other`.
 */
export function extractCustomMetaPairs(html: string): HeadMetaPair[] {
  const clean = sanitizeCustomHeadTags(html);
  if (!clean) return [];

  const pairs: HeadMetaPair[] = [];
  const metaRe =
    /<meta\b[^>]*(?:name|property)\s*=\s*["']([^"']+)["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*>|<meta\b[^>]*content\s*=\s*["']([^"']*)["'][^>]*(?:name|property)\s*=\s*["']([^"']+)["'][^>]*>/gi;

  let match: RegExpExecArray | null;
  while ((match = metaRe.exec(clean)) !== null) {
    const name = (match[1] || match[4] || '').trim();
    const content = (match[2] || match[3] || '').trim();
    if (name && content) pairs.push({ name, content });
  }
  return pairs;
}
