import { CollectionListPage } from '@/components/admin/CollectionPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Videos' };

export default function Page() {
  return <CollectionListPage collection="videos" />;
}
