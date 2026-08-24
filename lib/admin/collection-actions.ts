'use server';

import { randomBytes } from 'node:crypto';

import { asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';
import {
  collections,
  isCollectionKey,
  youtubeId,
  type CollectionKey,
} from '@/lib/collections';
import { db } from '@/lib/db';
import {
  revalidateCategory,
  revalidateGallery,
  revalidateJobs,
  revalidateNews,
  revalidatePartners,
  revalidateProduct,
  revalidateCollectionLists,
  revalidateVideos,
} from '@/lib/revalidate';
import { sanitizeHtml } from '@/lib/sanitize';
import {
  categories,
  galleryImages,
  jobOpenings,
  news,
  partners,
  products,
  videos,
} from '@/lib/schema';

/**
 * GENERIC COLLECTION CRUD.
 *
 * One save and one delete action serve all seven collections, driven by
 * lib/collections.ts. Each one authorises, validates against the collection's
 * zod schema, sanitizes rich HTML, writes, then revalidates the public routes
 * that show the record (PHASE2-BACKEND.md §9).
 */

export interface CrudResult {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Set on a successful create so the caller can navigate to the record. */
  id?: string;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Not authorised.');
}

const tables = {
  categories,
  products,
  news,
  gallery: galleryImages,
  videos,
  partners,
  jobs: jobOpenings,
} as const;

/** Which fields hold rich HTML, per collection. */
const htmlFields: Partial<Record<CollectionKey, string[]>> = {
  categories: ['description'],
  products: ['content'],
  news: ['content'],
};

const newId = () => randomBytes(16).toString('hex');

/** Walk the error chain looking for MySQL's unique-constraint violation. */
function isDuplicateKey(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current; depth++) {
    const e = current as { code?: string; errno?: number; message?: string; cause?: unknown };
    if (e.code === 'ER_DUP_ENTRY' || e.errno === 1062) return true;
    if (typeof e.message === 'string' && /duplicate entry/i.test(e.message)) return true;
    current = e.cause;
  }
  return false;
}

/* -------------------------------------------------------------------------- */

export async function saveRecord(
  key: string,
  id: string | null,
  rawJson: string,
): Promise<CrudResult> {
  await requireAdmin();
  if (!isCollectionKey(key)) return { ok: false, message: 'Unknown collection.' };

  const def = collections[key];

  let input: Record<string, unknown>;
  try {
    input = JSON.parse(rawJson);
  } catch {
    return { ok: false, message: 'The form could not be read. Reload and try again.' };
  }

  // Normalisations an editor should not have to do by hand.
  if (key === 'videos' && typeof input.youtubeId === 'string') {
    input.youtubeId = youtubeId(input.youtubeId);
  }
  if (key === 'products' && Array.isArray(input.images)) {
    // The editor edits images as [{src}]; the column stores string[].
    input.images = (input.images as { src?: string }[])
      .map((row) => (typeof row === 'string' ? row : (row?.src ?? '')))
      .filter(Boolean);
  }

  const parsed = def.schema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path.join('.') || '(root)'] = issue.message;
    }
    return { ok: false, message: 'Some fields need attention.', errors };
  }

  const values = { ...(parsed.data as Record<string, unknown>) };

  for (const field of htmlFields[key] ?? []) {
    if (typeof values[field] === 'string') {
      values[field] = sanitizeHtml(values[field] as string);
    }
  }

  // Dates arrive as yyyy-mm-dd strings; the columns are timestamps.
  if (key === 'news') values.publishedAt = new Date(String(values.publishedAt));
  if (key === 'videos') {
    values.publishedAt = values.publishedAt
      ? new Date(String(values.publishedAt))
      : new Date();
  }

  const table = tables[key];
  const recordId = id ?? newId();

  // Read the row before overwriting it: if the slug or category changed, the
  // OLD public path is still cached and must be purged too.
  let previous: Record<string, unknown> | null = null;
  if (id) {
    const [row] = await db.select().from(table).where(eq(table.id, id)).limit(1);
    previous = (row as Record<string, unknown>) ?? null;
  }

  try {
    if (id) {
      await db.update(table).set(values).where(eq(table.id, id));
    } else {
      await db.insert(table).values({ id: recordId, ...values } as never);
    }
  } catch (error) {
    // The most likely failure by far is a duplicate slug, which has a unique
    // index — say so plainly rather than surfacing a driver error. Drizzle
    // wraps the mysql2 error, so the ER_DUP_ENTRY detail sits on `cause`.
    if (isDuplicateKey(error)) {
      return {
        ok: false,
        message: 'That slug is already used by another record.',
        errors: { slug: 'Already taken — choose a different slug.' },
      };
    }
    throw error;
  }

  // Products store their category by slug. Renaming a category without
  // cascading would leave every product in it pointing at a category that no
  // longer exists — the listing would empty out and the product pages would be
  // unreachable. Move them with it.
  let movedProducts = 0;
  if (key === 'categories' && previous) {
    const before = String(previous.slug ?? '');
    const after = String(values.slug ?? '');
    if (before && after && before !== after) {
      const affected = await db
        .select({ slug: products.slug })
        .from(products)
        .where(eq(products.categorySlug, before));

      if (affected.length > 0) {
        await db
          .update(products)
          .set({ categorySlug: after })
          .where(eq(products.categorySlug, before));
        movedProducts = affected.length;

        // Each moved product changed URL: purge both the old and the new path.
        for (const product of affected) {
          revalidateProduct(after, product.slug, {
            categorySlug: before,
            slug: product.slug,
          });
        }
      }
    }
  }

  await revalidateFor(key, values, previous);
  revalidatePath(`/admin/${key}`);

  const moved =
    movedProducts > 0
      ? ` ${movedProducts} product${movedProducts === 1 ? '' : 's'} moved with it.`
      : '';

  return { ok: true, id: recordId, message: (id ? 'Saved.' : 'Created.') + moved };
}

export async function deleteRecord(key: string, id: string): Promise<CrudResult> {
  await requireAdmin();
  if (!isCollectionKey(key)) return { ok: false, message: 'Unknown collection.' };

  const table = tables[key];
  const [row] = await db.select().from(table).where(eq(table.id, id)).limit(1);
  if (!row) return { ok: false, message: 'That record no longer exists.' };

  // A category with products behind it would orphan them — refuse instead.
  if (key === 'categories') {
    const orphans = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categorySlug, (row as { slug: string }).slug))
      .limit(1);
    if (orphans.length > 0) {
      return {
        ok: false,
        message:
          'This category still has products. Move or delete them first, so none is left without a page.',
      };
    }
  }

  await db.delete(table).where(eq(table.id, id));

  await revalidateFor(key, row as Record<string, unknown>, null);
  revalidatePath(`/admin/${key}`);

  return { ok: true, message: 'Deleted.' };
}

/** Persist a new order for a whole collection from the id sequence. */
export async function reorderRecords(key: string, orderedIds: string[]) {
  await requireAdmin();
  if (!isCollectionKey(key)) return { ok: false, message: 'Unknown collection.' };

  if (!Array.isArray(orderedIds)) {
    return { ok: false, message: 'Expected a list of ids.' };
  }

  const table = tables[key];
  if (!('order' in table)) return { ok: false, message: 'This collection is unordered.' };

  const existing = await db.select({ id: table.id }).from(table).orderBy(asc(table.id));
  const known = new Set(existing.map((r) => r.id));
  const ids = orderedIds.filter((candidate) => known.has(candidate));
  if (ids.length !== known.size) {
    return { ok: false, message: 'The list changed. Reload and try again.' };
  }

  await Promise.all(
    ids.map((recordId, i) =>
      db
        .update(table)
        .set({ order: (i + 1) * 10 } as never)
        .where(eq(table.id, recordId)),
    ),
  );

  // Reordering never changes a record's URL — only the listings that show it.
  revalidateCollectionLists(key);
  revalidatePath(`/admin/${key}`);
  return { ok: true };
}

/**
 * Refresh whichever public routes show this collection.
 *
 * `previous` is the row as it was before an update, so a renamed slug (or a
 * product moved between categories) purges the path it used to live at as well
 * as the one it lives at now.
 */
async function revalidateFor(
  key: CollectionKey,
  values: Record<string, unknown>,
  previous: Record<string, unknown> | null,
) {
  const str = (source: Record<string, unknown> | null, field: string) =>
    source ? String(source[field] ?? '') : '';

  switch (key) {
    case 'categories':
      revalidateCategory(
        values.slug as string | undefined,
        previous ? str(previous, 'slug') : undefined,
      );
      break;
    case 'products':
      revalidateProduct(
        String(values.categorySlug ?? ''),
        String(values.slug ?? ''),
        previous
          ? { categorySlug: str(previous, 'categorySlug'), slug: str(previous, 'slug') }
          : undefined,
      );
      break;
    case 'news':
      revalidateNews(
        values.slug as string | undefined,
        previous ? str(previous, 'slug') : undefined,
      );
      break;
    case 'gallery':
      revalidateGallery();
      break;
    case 'videos':
      revalidateVideos();
      break;
    case 'partners':
      revalidatePartners();
      break;
    case 'jobs':
      revalidateJobs();
      break;
  }
}
