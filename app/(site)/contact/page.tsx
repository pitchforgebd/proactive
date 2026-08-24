import { notFound } from 'next/navigation';
import { getPage } from '@/lib/data';
import SectionRenderer from '@/components/sections/SectionRenderer';
import { buildPageMetadata } from '@/lib/page-meta';

/** ISR — a section edited in the dashboard appears without a rebuild (Mode A). */
export const revalidate = 60;

export const generateMetadata = buildPageMetadata('contact', {
  title: 'Contact',
  description:
    'Contact Proactive Trade International — 292, Inner Circular Road, Shatabdi Centre, Fakirapool, Motijheel, Dhaka-1000. Phone +880 1855 939 450.',
});

export default async function ContactPage() {
  const page = await getPage('contact');
  if (!page) notFound();

  return <SectionRenderer sections={page.sections} pageSlug="contact" />;
}
