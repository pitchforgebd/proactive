import { notFound } from 'next/navigation';
import { getPage } from '@/lib/data';
import SectionRenderer from '@/components/sections/SectionRenderer';
import { buildPageMetadata } from '@/lib/page-meta';

/** ISR — a section edited in the dashboard appears without a rebuild (Mode A). */
export const revalidate = 60;

export const generateMetadata = buildPageMetadata('vision-mission', {
  title: 'Vision & Mission',
  description:
    'To become a leading and trusted technology partner in the printing and packaging industry through innovation, excellence, and sustainable growth.',
});

export default async function VisionMissionPage() {
  const page = await getPage('vision-mission');
  if (!page) notFound();

  return <SectionRenderer sections={page.sections} pageSlug="vision-mission" />;
}
