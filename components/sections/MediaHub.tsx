import { getGalleryImages, getNews, getVideos } from '@/lib/data';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import RevealOnView from '@/components/motion/RevealOnView';
import type { MediaHubData } from '@/lib/sections/schemas';

/**
 * Media Centre hub cards. The card copy and images are section content; the
 * "12 articles" counts are read live from the collections via `countFrom`, so
 * they cannot drift out of date.
 */
export default async function MediaHub({ entries, tone, cropMarks }: MediaHubData) {
  const needs = new Set(entries.map((e) => e.countFrom));

  const [news, gallery, videos] = await Promise.all([
    needs.has('news') ? getNews() : Promise.resolve([]),
    needs.has('gallery') ? getGalleryImages() : Promise.resolve([]),
    needs.has('videos') ? getVideos() : Promise.resolve([]),
  ]);

  const counts = {
    news: news.length,
    gallery: gallery.length,
    videos: videos.length,
    none: 0,
  } as const;

  /** Falls back to the collection's own first image when none is set. */
  const fallbackImage = (from: MediaHubData['entries'][number]['countFrom']) => {
    if (from === 'news') return news[0]?.coverImage;
    if (from === 'gallery' || from === 'videos') return gallery[0]?.src;
    return undefined;
  };

  return (
    <Section tone={tone} cropMarks={cropMarks}>
      <ul className="grid gap-6 md:grid-cols-3">
        {entries.map((e, i) => {
          const image = e.image || fallbackImage(e.countFrom);
          if (!image) return null;

          const count = counts[e.countFrom];

          return (
            <RevealOnView as="li" key={e.href} delay={i * 70}>
              <Card
                href={e.href}
                title={e.title}
                image={image}
                description={e.description}
                eyebrow={
                  e.countFrom !== 'none' && e.unit ? `${count} ${e.unit}` : undefined
                }
                aspect="video"
                sizes="(min-width: 768px) 30vw, 92vw"
                className="h-full"
              />
            </RevealOnView>
          );
        })}
      </ul>
    </Section>
  );
}
