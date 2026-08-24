import { CollectionListPage } from '@/components/admin/CollectionPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'News' };

export default function Page() {
  return <CollectionListPage collection="news" />;
}
