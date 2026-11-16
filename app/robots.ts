import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/utils';

/**
 * robots.txt — public site only.
 * Sitemap URL stays the App Router MetadataRoute at /sitemap.xml.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        // Uploaded images are served through /api/files/images/… — the favicon,
        // logo, product and OG images all live there. Google's favicon and image
        // crawlers obey robots.txt, so this path must stay crawlable even though
        // the rest of /api/ is blocked (the longer, more specific rule wins).
        '/api/files/images/',
      ],
      disallow: [
        // Form / file / auth handlers — nothing to index.
        '/api/',
        // Dashboard and login.
        '/admin/',
      ],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
