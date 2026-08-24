import { notFound } from 'next/navigation';
import { getPage } from '@/lib/data';
import SectionRenderer from '@/components/sections/SectionRenderer';
import { buildPageMetadata } from '@/lib/page-meta';

/** ISR — a section edited in the dashboard appears without a rebuild (Mode A). */
export const revalidate = 60;

export const generateMetadata = buildPageMetadata('founder-message', {
  title: 'Message from Founder & CEO',
  description:
    'A message from Mr. Billal Hossain Bappi, Founder & CEO of Proactive Trade International, on why the company was built around service and local stock.',
});

export default async function FounderMessagePage() {
  const page = await getPage('founder-message');
  if (!page) notFound();

  return <SectionRenderer sections={page.sections} pageSlug="founder-message" />;
}
