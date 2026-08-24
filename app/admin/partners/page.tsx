import { CollectionListPage } from '@/components/admin/CollectionPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Partners' };

export default function Page() {
  return <CollectionListPage collection="partners" />;
}
