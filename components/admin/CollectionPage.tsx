import Link from 'next/link';
import { redirect } from 'next/navigation';
import { asc, desc } from 'drizzle-orm';
import { Plus } from 'lucide-react';

import { auth } from '@/auth';
import AdminShell from '@/components/admin/AdminShell';
import RecordForm from '@/components/admin/RecordForm';
import { collections, type CollectionKey } from '@/lib/collections';
import { db } from '@/lib/db';
import {
  categories,
  galleryImages,
  jobOpenings,
  news,
  partners,
  products,
  videos,
} from '@/lib/schema';
import type { FieldDescriptor } from '@/lib/sections/introspect';

/**
 * Shared server components for the collection screens.
 *
 * The thin route files under app/admin/<collection>/ exist so each collection
 * keeps the URL PHASE2-BACKEND.md §7 specifies; all of them render these.
 */

const tables = {
  categories,
  products,
  news,
  gallery: galleryImages,
  videos,
  partners,
  jobs: jobOpenings,
} as const;

async function rowsFor(key: CollectionKey) {
  // News reads newest first; every other collection has an explicit order
  // column the editor controls.
  if (key === 'news') return db.select().from(news).orderBy(desc(news.publishedAt));
  if (key === 'categories') return db.select().from(categories).orderBy(asc(categories.order));
  if (key === 'products') return db.select().from(products).orderBy(asc(products.order));
  if (key === 'gallery') return db.select().from(galleryImages).orderBy(asc(galleryImages.order));
  if (key === 'videos') return db.select().from(videos).orderBy(asc(videos.order));
  if (key === 'partners') return db.select().from(partners).orderBy(asc(partners.order));
  return db.select().from(jobOpenings).orderBy(asc(jobOpenings.order));
}

/** Category options are read live so a new category is immediately selectable. */
async function fieldsFor(key: CollectionKey): Promise<FieldDescriptor[]> {
  const def = collections[key];
  if (key !== 'products') return def.fields;

  const cats = await db
    .select({ slug: categories.slug })
    .from(categories)
    .orderBy(asc(categories.order));

  return def.fields.map((field) =>
    field.name === 'categorySlug'
      ? { ...field, options: cats.map((c) => c.slug) }
      : field,
  );
}

/* -------------------------------------------------------------------------- */

export async function CollectionListPage({ collection }: { collection: CollectionKey }) {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  const def = collections[collection];
  const rows = (await rowsFor(collection)) as Record<string, unknown>[];

  return (
    <AdminShell title={def.label} lede={def.lede} user={session.user}>
      <div className="mb-6">
        <Link
          href={`/admin/${collection}/new`}
          className="inline-flex items-center gap-2 rounded-md bg-cyan px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-band transition-colors hover:bg-magenta hover:text-white"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add {def.singular}
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink/25 px-6 py-10 text-center text-sm text-graphite">
          No {def.label.toLowerCase()} yet. Add the first one above.
        </p>
      ) : (
        <ul className="grid gap-px overflow-hidden rounded-xl border border-ink/10 bg-ink/10">
          {rows.map((row) => {
            const image = def.imageField ? String(row[def.imageField] ?? '') : '';
            const title = String(row[def.titleField] ?? '') || '(untitled)';
            const subtitle = def.subtitleField
              ? String(row[def.subtitleField] ?? '')
              : '';

            return (
              <li key={String(row.id)} className="bg-paper-2">
                <Link
                  href={`/admin/${collection}/${row.id}`}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-ink/[0.03]"
                >
                  {def.imageField && (
                    <span className="flex h-[52px] w-[78px] shrink-0 items-center justify-center overflow-hidden rounded-md border border-ink/10 bg-ink/[0.04]">
                      {image && (
                        // Arbitrary admin-supplied paths — next/image would need
                        // every one configured.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt="" className="h-full w-full object-cover" />
                      )}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {title}
                      </span>
                      {collection === 'products' && row.featured ? (
                        <span className="shrink-0 rounded bg-cyan/15 px-1.5 py-0.5 font-mono text-[9px] uppercase text-cyan">
                          Featured
                        </span>
                      ) : null}
                    </span>
                    {subtitle && (
                      <span className="mt-0.5 block truncate font-mono text-xs text-graphite">
                        {subtitle}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-cyan">
                    Edit
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}

/* -------------------------------------------------------------------------- */

export async function CollectionEditPage({
  collection,
  id,
}: {
  collection: CollectionKey;
  /** 'new' creates a record. */
  id: string;
}) {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  const def = collections[collection];
  const fields = await fieldsFor(collection);
  const creating = id === 'new';

  let initial: Record<string, unknown> = { ...def.blank };

  if (!creating) {
    const table = tables[collection];
    const rows = (await db.select().from(table)) as Record<string, unknown>[];
    const row = rows.find((r) => String(r.id) === id);
    if (!row) {
      return (
        <AdminShell
          title="Not found"
          lede={`That ${def.singular} no longer exists — it may have been deleted in another tab.`}
          user={session.user}
        >
          <Link
            href={`/admin/${collection}`}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-cyan"
          >
            Back to {def.label}
          </Link>
        </AdminShell>
      );
    }

    initial = { ...def.blank, ...row };

    // Normalise stored shapes back into what the editor expects.
    if (collection === 'products') {
      const images = Array.isArray(row.images) ? (row.images as string[]) : [];
      initial.images = images.map((src) => ({ src }));
      initial.specs = Array.isArray(row.specs) ? row.specs : [];
      initial.featured = Boolean(row.featured);
    }
    for (const key of ['publishedAt'] as const) {
      if (row[key] instanceof Date) {
        initial[key] = (row[key] as Date).toISOString().slice(0, 10);
      }
    }
    // Null columns would render as the string "null" in a text input.
    for (const [key, value] of Object.entries(initial)) {
      if (value === null) initial[key] = def.blank[key] ?? '';
    }
  }

  return (
    <AdminShell
      title={creating ? `New ${def.singular}` : `Edit ${def.singular}`}
      lede={def.lede}
      user={session.user}
    >
      <RecordForm
        collection={collection}
        singular={def.singular}
        recordId={creating ? null : id}
        fields={fields}
        initial={initial}
        backHref={`/admin/${collection}`}
        slugFrom={def.slugFrom}
      />
    </AdminShell>
  );
}
