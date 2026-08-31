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
      allow: '/',
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
