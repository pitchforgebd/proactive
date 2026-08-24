import { redirect } from 'next/navigation';
import { desc } from 'drizzle-orm';

import { auth } from '@/auth';
import AdminShell from '@/components/admin/AdminShell';
import Inbox, { type InboxEntry } from '@/components/admin/Inbox';
import { db } from '@/lib/db';
import { careerApplications } from '@/lib/schema';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Applications' };

export default async function CareerInbox() {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  const rows = await db
    .select()
    .from(careerApplications)
    .orderBy(desc(careerApplications.createdAt));

  const entries: InboxEntry[] = rows.map((r) => ({
    id: r.id,
    name: r.fullName,
    email: r.email,
    phone: r.phone ?? '',
    heading: r.position ? `· ${r.position}` : '',
    body: r.coverLetter ?? '',
    // CVs are private: served only through the authenticated admin route.
    resumeUrl: r.resumeUrl ?? undefined,
    read: Boolean(r.read),
    createdAt: (r.createdAt ?? new Date()).toISOString(),
  }));

  return (
    <AdminShell
      title="Applications"
      lede="Career applications from /career, newest first. CVs download through an authenticated route — they are never publicly reachable."
      user={session.user}
    >
      <Inbox kind="career" entries={entries} />
    </AdminShell>
  );
}
