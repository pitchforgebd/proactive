import { CollectionListPage } from '@/components/admin/CollectionPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Categories' };

export default function Page() {
  return <CollectionListPage collection="categories" />;
}
