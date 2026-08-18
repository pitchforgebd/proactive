import type { Metadata } from 'next';
import { getGalleryImages, getNews, getVideos } from '@/lib/data';
import PageHero from '@/components/layout/PageHero';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import RevealOnView from '@/components/motion/RevealOnView';
import CTABand from '@/components/ui/CTABand';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Media Centre',
  description:
    'News, photo gallery and video gallery from Proactive Trade International — installations, press rooms and industry updates.',
  alternates: { canonical: '/media' },
};

export default async function MediaPage() {
  const [news, gallery, videos] = await Promise.all([
    getNews(),
    getGalleryImages(),
    getVideos(),
  ]);

  const entries = [
    {
      href: '/media/news',
      title: 'News',
      description:
        'Installations, partnerships and company updates from across our operation.',
      image: news[0]?.coverImage ?? '/images/news/warehouse-expansion.png',
      count: news.length,
      unit: 'articles',
    },
    {
      href: '/media/photo-gallery',
      title: 'Photo Gallery',
      description:
        'Machinery installations, press rooms, warehousing and the teams behind them.',
      image: gallery[0]?.src ?? '/images/gallery/gallery-01.png',
      count: gallery.length,
      unit: 'photographs',
    },
    {
      href: '/media/video-gallery',
      title: 'Video Gallery',
      description:
        'Workflow walkthroughs, machinery in production and technical explainers.',
      image: gallery[4]?.src ?? '/images/gallery/gallery-05.png',
      count: videos.length,
      unit: 'videos',
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Media Centre"
        title="What we are building, printing and commissioning."
        lede="Company news, photography from installations and press rooms, and video walkthroughs of the workflows we supply."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Media Centre' }]}
      />

      <Section tone="paper-2" cropMarks>
        <ul className="grid gap-6 md:grid-cols-3">
          {entries.map((e, i) => (
            <RevealOnView as="li" key={e.href} delay={i * 70}>
              <Card
                href={e.href}
                title={e.title}
                image={e.image}
                description={e.description}
                eyebrow={`${e.count} ${e.unit}`}
                aspect="video"
                sizes="(min-width: 768px) 30vw, 92vw"
                className="h-full"
              />
            </RevealOnView>
          ))}
        </ul>
      </Section>

      <CTABand />
    </>
  );
}
