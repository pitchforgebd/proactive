import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ExternalLink, Search } from 'lucide-react';
import { asc, eq } from 'drizzle-orm';

import { auth } from '@/auth';
import AddSection, { type SectionTypeOption } from '@/components/admin/AddSection';
import AdminShell from '@/components/admin/AdminShell';
import SectionList, { type SectionRowView } from '@/components/admin/SectionList';
import { db } from '@/lib/db';
import { isPageSlug, pageLabels, pagePathMap } from '@/lib/pages';
import { pages, sections } from '@/lib/schema';
import {
  getSectionEntry,
  sectionGroups,
  sectionRegistry,
  sectionTypes,
} from '@/lib/sections/registry';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: isPageSlug(params.slug) ? pageLabels[params.slug] : 'Page' };
}

/**
 * Pull a human-readable line out of a section's data so the list row is
 * identifiable at a glance — the first non-trivial string, tags stripped.
 */
function previewOf(data: unknown): string {
  const preferred = ['title', 'heading', 'headline', 'eyebrow', 'name', 'quote', 'html'];
  if (!data || typeof data !== 'object') return '';
  const record = data as Record<string, unknown>;

  const clean = (value: string) =>
    value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  for (const key of preferred) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      const text = clean(value);
      if (text) return text.length > 90 ? `${text.slice(0, 90)}…` : text;
    }
  }

  // Fall back to the first string of any length — some types (visionMission,
  // partners) have no field with a conventional heading name.
  for (const value of Object.values(record)) {
    if (typeof value === 'string' && value.trim().length > 3) {
      const text = clean(value);
      if (text) return text.length > 90 ? `${text.slice(0, 90)}…` : text;
    }
  }
  return '';
}

export default async function SectionEditorPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  if (!isPageSlug(params.slug)) notFound();
  const slug = params.slug;

  const [pageRow] = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  if (!pageRow) notFound();

  // includeHidden: the dashboard must show hidden sections so they can be
  // switched back on. The public reader filters them out.
  const rows = await db
    .select()
    .from(sections)
    .where(eq(sections.pageSlug, slug))
    .orderBy(asc(sections.order));

  const list: SectionRowView[] = rows.map((row) => {
    const entry = getSectionEntry(row.type);
    return {
      id: row.id,
      type: row.type,
      typeLabel: entry?.label ?? row.type,
      preview: previewOf(row.data),
      visible: Boolean(row.visible),
      known: Boolean(entry),
    };
  });

  const options: SectionTypeOption[] = sectionTypes.map((type) => ({
    type,
    label: sectionRegistry[type].label,
    hint: sectionRegistry[type].hint,
    group: sectionRegistry[type].group,
  }));

  return (
    <AdminShell
      title={pageRow.title || pageLabels[slug]}
      lede="Reorder, hide or edit the blocks that make up this page. Changes go live within seconds of saving."
      user={session.user}
    >
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-graphite transition-colors hover:text-cyan"
        >
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
          All pages
        </Link>
        <span aria-hidden="true" className="text-ink/20">
          |
        </span>
        <Link
          href={`/admin/pages/${slug}/seo`}
          className="inline-flex items-center gap-1.5 rounded-sm border border-ink/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-graphite transition-colors hover:border-cyan hover:text-cyan"
        >
          <Search aria-hidden="true" className="h-3.5 w-3.5" />
          SEO &amp; title
        </Link>
        <Link
          href={pagePathMap[slug]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-sm border border-ink/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-graphite transition-colors hover:border-cyan hover:text-cyan"
        >
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          View live page
        </Link>
      </div>

      <SectionList pageSlug={slug} sections={list} />

      <AddSection pageSlug={slug} groups={[...sectionGroups]} options={options} />
    </AdminShell>
  );
}
