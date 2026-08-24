import { notFound } from 'next/navigation';
import { getPage } from '@/lib/data';
import SectionRenderer from '@/components/sections/SectionRenderer';
import { buildPageMetadata } from '@/lib/page-meta';

/** ISR — a section edited in the dashboard appears without a rebuild (Mode A). */
export const revalidate = 60;

export const generateMetadata = buildPageMetadata('our-story', {
  title: 'Our Story',
  description:
    'From fifteen years on the factory floor to serving 100+ printing and packaging companies — the story of Proactive Trade International.',
});

export default async function OurStoryPage() {
  const page = await getPage('our-story');
  if (!page) notFound();

  return <SectionRenderer sections={page.sections} pageSlug="our-story" />;
}
