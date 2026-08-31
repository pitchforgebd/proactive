import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { sql } from 'drizzle-orm';

import { auth } from '@/auth';
import AdminShell from '@/components/admin/AdminShell';
import { db } from '@/lib/db';
import { pageLabels, pagePathMap, PAGE_SLUGS } from '@/lib/pages';
import { pages, sections } from '@/lib/schema';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Pages & Sections' };

export default async function AdminPagesList() {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  const [pageRows, counts] = await Promise.all([
    db.select().from(pages),
    db
      .select({
        pageSlug: sections.pageSlug,
        total: sql<number>`count(*)`,
        hidden: sql<number>`sum(case when ${sections.visible} = 0 then 1 else 0 end)`,
      })
      .from(sections)
      .groupBy(sections.pageSlug),
  ]);

  const bySlug = new Map(pageRows.map((p) => [p.slug, p]));
  const countBySlug = new Map(
    counts.map((c) => [c.pageSlug, { total: Number(c.total), hidden: Number(c.hidden) }]),
  );

  return (
    <AdminShell
      title="Pages & Sections"
      lede="Every page is an ordered list of sections. Section layouts are fixed in code — here you edit their content, reorder them, and hide or show them."
      user={session.user}
    >
      <ul className="grid gap-px overflow-hidden rounded-xl border border-ink/10 bg-ink/10">
        {PAGE_SLUGS.map((slug) => {
          const page = bySlug.get(slug);
          const count = countBySlug.get(slug) ?? { total: 0, hidden: 0 };

          return (
            <li key={slug} className="bg-paper-2">
              <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-ink">
                    {page?.title || pageLabels[slug]}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-graphite">
                    <span>{pagePathMap[slug]}</span>
                    <span>
                      {count.total} section{count.total === 1 ? '' : 's'}
                      {count.hidden > 0 && ` · ${count.hidden} hidden`}
                    </span>
                    {page?.updatedAt && (
                      <span>edited {formatDate(page.updatedAt.toISOString())}</span>
                    )}
                    {!page && <span className="text-magenta">not in the database</span>}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={pagePathMap[slug]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-ink/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-graphite transition-colors hover:border-cyan hover:text-cyan"
                  >
                    <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                    View
                  </Link>
                  <Link
                    href={`/admin/pages/${slug}`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-cyan px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-band transition-colors hover:bg-magenta hover:text-white"
                  >
                    Edit
                    <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 max-w-2xl text-sm text-graphite">
        Pages themselves are fixed: each one has a route in the codebase. Adding a new
        page is a developer change, which is what keeps every URL backed by real code.
      </p>
    </AdminShell>
  );
}
