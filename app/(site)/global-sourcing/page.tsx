import { notFound } from 'next/navigation';
import { getPage } from '@/lib/data';
import SectionRenderer from '@/components/sections/SectionRenderer';
import { buildPageMetadata } from '@/lib/page-meta';

/** ISR — a section edited in the dashboard appears without a rebuild (Mode A). */
export const revalidate = 60;

export const generateMetadata = buildPageMetadata('global-sourcing', {
  title: 'Global Sourcing',
  description:
    'Sourcing is where uptime is won or lost. Our global network exists so that a machine specified in Dhaka is supported by a manufacturer, a spare-part channel and a consumable supply line arranged before the order was signed.',
});

export default async function GlobalSourcingPage() {
  const page = await getPage('global-sourcing');
  if (!page) notFound();

  return <SectionRenderer sections={page.sections} pageSlug="global-sourcing" />;
}
