import { notFound } from 'next/navigation';
import { getPage } from '@/lib/data';
import SectionRenderer from '@/components/sections/SectionRenderer';
import { buildPageMetadata } from '@/lib/page-meta';

/** ISR — a section edited in the dashboard appears without a rebuild (Mode A). */
export const revalidate = 60;

export const generateMetadata = buildPageMetadata('about', {
  title: 'About Us',
  description:
    'Founded in 2024, Proactive Trade International is a trusted printing and packaging solutions provider in Bangladesh, serving 100+ top-tier printing and packaging companies.',
});

export default async function AboutPage() {
  const page = await getPage('about');
  if (!page) notFound();

  return <SectionRenderer sections={page.sections} pageSlug="about" />;
}
