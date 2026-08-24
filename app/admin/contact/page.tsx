import { redirect } from 'next/navigation';
import { desc } from 'drizzle-orm';

import { auth } from '@/auth';
import AdminShell from '@/components/admin/AdminShell';
import Inbox, { type InboxEntry } from '@/components/admin/Inbox';
import { db } from '@/lib/db';
import { contactMessages } from '@/lib/schema';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Messages' };

export default async function ContactInbox() {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  const rows = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));

  const entries: InboxEntry[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone ?? '',
    heading: r.subject ? `· ${r.subject}` : '',
    body: r.message,
    read: Boolean(r.read),
    createdAt: (r.createdAt ?? new Date()).toISOString(),
  }));

  return (
    <AdminShell
      title="Messages"
      lede="Enquiries from the contact form, newest first."
      user={session.user}
    >
      <Inbox kind="contact" entries={entries} />
    </AdminShell>
  );
}
