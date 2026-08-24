import { notFound, redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';

import { auth } from '@/auth';
import AdminShell from '@/components/admin/AdminShell';
import SectionForm from '@/components/admin/SectionForm';
import { db } from '@/lib/db';
import { isPageSlug, pageLabels } from '@/lib/pages';
import { sections } from '@/lib/schema';
import { describeSectionSchema } from '@/lib/sections/introspect';
import { getSectionEntry } from '@/lib/sections/registry';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Edit section' };

/**
 * Edit one section's content.
 *
 * The form is generated here from the section type's zod schema — the field
 * descriptors are plain JSON, so zod itself never crosses into the client
 * bundle. Parsing the stored data through the schema first means an older row
 * that predates a new field still opens, populated with that field's default
 * rather than blank.
 */
export default async function EditSectionPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  if (!isPageSlug(params.slug)) notFound();
  const slug = params.slug;

  const [row] = await db
    .select()
    .from(sections)
    .where(and(eq(sections.id, params.id), eq(sections.pageSlug, slug)))
    .limit(1);

  if (!row) notFound();

  const entry = getSectionEntry(row.type);
  if (!entry) {
    return (
      <AdminShell
        title="Unknown section type"
        lede={`This section is stored as "${row.type}", which is not in the section registry. It is skipped when the page renders.`}
        user={session.user}
      >
        <p className="max-w-2xl text-sm text-graphite">
          Either a developer removed the type, or the row was written outside the
          dashboard. Delete it from the page, or ask a developer to restore the type
          in <code className="font-mono text-xs">lib/sections/registry.ts</code>.
        </p>
      </AdminShell>
    );
  }

  const fields = describeSectionSchema(entry.schema);

  // Fill in anything the stored row is missing (a field added since it was
  // written) so the form opens with schema defaults rather than undefined.
  const parsed = entry.schema.safeParse(row.data);
  const initialData = (
    parsed.success ? parsed.data : (row.data ?? entry.defaults)
  ) as Record<string, unknown>;

  return (
    <AdminShell
      title={pageLabels[slug]}
      lede={parsed.success ? undefined : 'This section’s stored content does not match its schema. Fix the highlighted fields and save to repair it.'}
      user={session.user}
    >
      <SectionForm
        pageSlug={slug}
        sectionId={row.id}
        typeLabel={entry.label}
        typeHint={entry.hint}
        fields={fields}
        initialData={initialData}
        backHref={`/admin/pages/${slug}`}
      />
    </AdminShell>
  );
}
