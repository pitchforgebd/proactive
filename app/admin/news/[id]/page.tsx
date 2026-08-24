import { CollectionEditPage } from '@/components/admin/CollectionPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'News' };

/** `id` of "new" creates a record; anything else edits that record. */
export default function Page({ params }: { params: { id: string } }) {
  return <CollectionEditPage collection="news" id={params.id} />;
}
