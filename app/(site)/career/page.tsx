import { notFound } from 'next/navigation';
import { getPage } from '@/lib/data';
import SectionRenderer from '@/components/sections/SectionRenderer';
import { buildPageMetadata } from '@/lib/page-meta';

/** ISR — a section edited in the dashboard appears without a rebuild (Mode A). */
export const revalidate = 60;

export const generateMetadata = buildPageMetadata('career', {
  title: 'Career',
  description:
    'Join Proactive Trade International — field service engineers, technical sales and CRM roles in printing and packaging supply across Bangladesh.',
});

export default async function CareerPage() {
  const page = await getPage('career');
  if (!page) notFound();

  return <SectionRenderer sections={page.sections} pageSlug="career" />;
}
