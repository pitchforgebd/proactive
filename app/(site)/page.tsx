/**
 * Home. Every band on this page is a section row in the database; the design
 * of each one stays coded in components/sections/.
 */
import { notFound } from 'next/navigation';
import { getPage } from '@/lib/data';
import SectionRenderer from '@/components/sections/SectionRenderer';
import { buildPageMetadata } from '@/lib/page-meta';

/** ISR — a section edited in the dashboard appears without a rebuild (Mode A). */
export const revalidate = 60;

export const generateMetadata = buildPageMetadata('home', {
  title: 'Proactive Trade International — One-Stop Printing & Packaging Solutions',
  description:
    'Trusted supplier of printing and packaging machineries, press room chemicals, inks, coatings and consumables in Bangladesh. Serving 100+ printing and packaging companies.',
  absoluteTitle: true,
});

export default async function HomePage() {
  const page = await getPage('home');
  if (!page) notFound();

  return <SectionRenderer sections={page.sections} pageSlug="home" />;
}
