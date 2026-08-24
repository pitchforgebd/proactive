import Link from 'next/link';
import { redirect } from 'next/navigation';
import { sql } from 'drizzle-orm';
import type { MySqlTable } from 'drizzle-orm/mysql-core';

import { auth } from '@/auth';
import AdminShell from '@/components/admin/AdminShell';
import { db } from '@/lib/db';
import {
  careerApplications,
  categories,
  contactMessages,
  galleryImages,
  news,
  pages,
  products,
  sections,
  videos,
} from '@/lib/schema';
import { pageLabels, pagePathMap, PAGE_SLUGS } from '@/lib/pages';

/** The dashboard reads live data on every request — never a cached snapshot. */
export const dynamic = 'force-dynamic';

async function countOf(table: MySqlTable): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)` }).from(table);
  return Number(row?.n ?? 0);
}

export default async function AdminHomePage() {
  const session = await auth();
  // Belt and braces: middleware already guards this, but a page that reads the
  // database should never assume it ran.
  if (!session?.user) redirect('/admin/login');

  const [
    pageCount,
    sectionCount,
    categoryCount,
    productCount,
    newsCount,
    galleryCount,
    videoCount,
    applicationCount,
    messageCount,
  ] = await Promise.all([
    countOf(pages),
    countOf(sections),
    countOf(categories),
    countOf(products),
    countOf(news),
    countOf(galleryImages),
    countOf(videos),
    countOf(careerApplications),
    countOf(contactMessages),
  ]);

  const stats = [
    { label: 'Pages', value: pageCount },
    { label: 'Sections', value: sectionCount },
    { label: 'Categories', value: categoryCount },
    { label: 'Products', value: productCount },
    { label: 'News articles', value: newsCount },
    { label: 'Gallery images', value: galleryCount },
    { label: 'Videos', value: videoCount },
    { label: 'Applications', value: applicationCount },
    { label: 'Messages', value: messageCount },
  ];

  return (
    <AdminShell
      title={`Welcome back, ${session.user.name?.split(' ')[0] ?? 'there'}.`}
      lede="Everything on the public site is edited from here. Section layouts are fixed in code; you change their content, order and visibility."
      user={session.user}
    >
      <section aria-labelledby="counts">
        <h2 id="counts" className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          Content
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="bg-paper-2 p-5">
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
                {s.label}
              </dt>
              <dd className="mt-2 font-display text-2xl font-bold leading-none text-ink">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="pages" className="mt-12">
        <h2 id="pages" className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          Pages
        </h2>
        <ul className="mt-4 grid gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {PAGE_SLUGS.map((slug) => (
            <li key={slug} className="bg-paper-2 p-5">
              <p className="text-sm font-semibold text-ink">{pageLabels[slug]}</p>
              <p className="mt-1 font-mono text-xs text-graphite">{pagePathMap[slug]}</p>
              <Link
                href={pagePathMap[slug]}
                className="mt-3 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-cyan transition-colors hover:text-magenta"
              >
                View live →
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-graphite">
          The section editor arrives with the next step. Until then these pages are
          served from the seeded content.
        </p>
      </section>
    </AdminShell>
  );
}
