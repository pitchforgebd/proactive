import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { auth } from '@/auth';
import AdminShell from '@/components/admin/AdminShell';
import SettingsForm from '@/components/admin/SettingsForm';
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);

  return (
    <AdminShell
      title="Settings"
      lede="Contact details, social links and the map location. These appear in the header, the footer, the contact page and every call-to-action band — change them once here."
      user={session.user}
    >
      <SettingsForm
        initial={{
          companyName: row?.companyName ?? '',
          phone: row?.phone ?? '',
          email: row?.email ?? '',
          address: row?.address ?? '',
          mapQuery: row?.mapQuery ?? '',
          facebook: row?.facebook ?? '',
          linkedin: row?.linkedin ?? '',
          instagram: row?.instagram ?? '',
          youtube: row?.youtube ?? '',
        }}
      />
    </AdminShell>
  );
}
