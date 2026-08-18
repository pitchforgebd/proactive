import type { MetadataRoute } from 'next';
import { getCategories, getNews, getProducts } from '@/lib/data';
import { absoluteUrl } from '@/lib/utils';

/** Static routes with hand-set priorities; dynamic ones are appended below. */
const staticRoutes: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/about/founder-message', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/products', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/vision-mission', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/global-sourcing', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/our-story', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/company', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/media', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/media/news', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/media/photo-gallery', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/media/video-gallery', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/career', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, news] = await Promise.all([
    getCategories(),
    getProducts(),
    getNews(),
  ]);

  const now = new Date();

  return [
    ...staticRoutes.map((r) => ({
      url: absoluteUrl(r.path),
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...categories.map((c) => ({
      url: absoluteUrl('/products/' + c.slug),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: absoluteUrl('/products/' + p.categorySlug + '/' + p.slug),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...news.map((n) => ({
      url: absoluteUrl('/media/news/' + n.slug),
      lastModified: new Date(n.publishedAt),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ];
}
