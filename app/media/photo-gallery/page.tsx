import type { Metadata } from 'next';
import { getGalleryImages } from '@/lib/data';
import PageHero from '@/components/layout/PageHero';
import Section from '@/components/ui/Section';
import GalleryGrid from '@/components/media/GalleryGrid';
import CTABand from '@/components/ui/CTABand';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Photo Gallery',
  description:
    'Photographs from machinery installations, press rooms, warehousing and team operations at Proactive Trade International.',
  alternates: { canonical: '/media/photo-gallery' },
};

export default async function PhotoGalleryPage() {
  const images = await getGalleryImages();

  return (
    <>
      <PageHero
        eyebrow="Media Centre"
        title="Photo Gallery"
        lede="Installations, press rooms, warehousing and the teams behind them."
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Media Centre', href: '/media' },
          { label: 'Photo Gallery' },
        ]}
      />

      <Section tone="paper-2" cropMarks>
        <GalleryGrid images={images} />
      </Section>

      <CTABand />
    </>
  );
}
