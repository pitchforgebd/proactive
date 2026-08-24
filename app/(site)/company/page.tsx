import { notFound } from 'next/navigation';
import { getPage } from '@/lib/data';
import SectionRenderer from '@/components/sections/SectionRenderer';
import { buildPageMetadata } from '@/lib/page-meta';

/** ISR — a section edited in the dashboard appears without a rebuild (Mode A). */
export const revalidate = 60;

export const generateMetadata = buildPageMetadata('company', {
  title: 'Company',
  description:
    'Proactive Trade International is a Dhaka-based supplier of printing and packaging machineries and consumables, operating across Bangladesh with global sourcing partnerships and local warehousing.',
});

export default async function CompanyPage() {
  const page = await getPage('company');
  if (!page) notFound();

  return <SectionRenderer sections={page.sections} pageSlug="company" />;
}
