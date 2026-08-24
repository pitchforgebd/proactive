import { notFound } from 'next/navigation';
import { getPage } from '@/lib/data';
import SectionRenderer from '@/components/sections/SectionRenderer';
import { buildPageMetadata } from '@/lib/page-meta';

/** ISR — a section edited in the dashboard appears without a rebuild (Mode A). */
export const revalidate = 60;

export const generateMetadata = buildPageMetadata('media', {
  title: 'Media Centre',
  description:
    'News, photo gallery and video gallery from Proactive Trade International — installations, press rooms and industry updates.',
});

export default async function MediaPage() {
  const page = await getPage('media');
  if (!page) notFound();

  return <SectionRenderer sections={page.sections} pageSlug="media" />;
}
