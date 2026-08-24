import { notFound } from 'next/navigation';
import { getPage } from '@/lib/data';
import SectionRenderer from '@/components/sections/SectionRenderer';
import { buildPageMetadata } from '@/lib/page-meta';

/** ISR — a section edited in the dashboard appears without a rebuild (Mode A). */
export const revalidate = 60;

export const generateMetadata = buildPageMetadata('products', {
  title: 'What We Offer — Printing & Packaging Solutions',
  description:
    'Machineries, press room chemicals, inks and coatings, blankets, plates, adhesives and papers — the full production chain for printing and packaging.',
});

export default async function ProductsPage() {
  const page = await getPage('products');
  if (!page) notFound();

  return <SectionRenderer sections={page.sections} pageSlug="products" />;
}
