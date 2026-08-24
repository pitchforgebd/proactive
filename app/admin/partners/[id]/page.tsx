import { CollectionEditPage } from '@/components/admin/CollectionPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Partners' };

/** `id` of "new" creates a record; anything else edits that record. */
export default function Page({ params }: { params: { id: string } }) {
  return <CollectionEditPage collection="partners" id={params.id} />;
}
