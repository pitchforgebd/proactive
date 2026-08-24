import { CollectionEditPage } from '@/components/admin/CollectionPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Videos' };

/** `id` of "new" creates a record; anything else edits that record. */
export default function Page({ params }: { params: { id: string } }) {
  return <CollectionEditPage collection="videos" id={params.id} />;
}
