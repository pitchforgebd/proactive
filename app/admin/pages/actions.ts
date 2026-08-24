'use server';

import { randomBytes } from 'node:crypto';

import { and, asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { isPageSlug, pathForPage } from '@/lib/pages';
import { revalidatePage } from '@/lib/revalidate';
import { sanitizeHtml } from '@/lib/sanitize';
import { pages, sections } from '@/lib/schema';
import { getSectionEntry, isSectionType } from '@/lib/sections/registry';

/**
 * SECTION EDITOR ACTIONS.
 *
 * Every action here:
 *   1. checks the session (middleware guards the pages, not the actions —
 *      a Server Action is a POST endpoint and must authorise itself);
 *   2. validates its input, including the section data against the registry's
 *      zod schema, so nothing that would fail to render can be saved;
 *   3. sanitizes rich HTML before it is written;
 *   4. revalidates the affected public path, so the change is live in seconds.
 */

export interface ActionResult {
  ok: boolean;
  message?: string;
  /** Field path → message, for the editor to show inline. */
  errors?: Record<string, string>;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Not authorised.');
  return session.user;
}

function assertPage(slug: string) {
  if (!isPageSlug(slug)) throw new Error(`Unknown page "${slug}".`);
  return slug;
}

const newId = () => randomBytes(16).toString('hex');

/** Recursively sanitize any `html` string field in a section's data. */
function sanitizeData(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeData);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, v]) => [
        key,
        key === 'html' && typeof v === 'string' ? sanitizeHtml(v) : sanitizeData(v),
      ]),
    );
  }
  return value;
}

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

/** Add a section of the given type, with the registry's default content. */
export async function addSection(pageSlug: string, type: string) {
  await requireAdmin();
  const slug = assertPage(pageSlug);

  const entry = getSectionEntry(type);
  if (!entry || !isSectionType(type)) throw new Error(`Unknown section type "${type}".`);

  // Defaults are guaranteed valid by scripts/check-registry.ts, but parse them
  // anyway so the stored row is always schema-shaped.
  const parsed = entry.schema.safeParse(entry.defaults);
  if (!parsed.success) throw new Error(`Defaults for "${type}" are invalid.`);

  const existing = await db
    .select({ order: sections.order })
    .from(sections)
    .where(eq(sections.pageSlug, slug));
  const nextOrder =
    existing.reduce((max, r) => Math.max(max, r.order), 0) + 10;

  const id = newId();
  await db.insert(sections).values({
    id,
    pageSlug: slug,
    type,
    order: nextOrder,
    visible: true,
    data: sanitizeData(parsed.data),
  });

  revalidatePath(`/admin/pages/${slug}`);
  revalidatePage(slug);

  // Straight into the editor: a section full of placeholder text is not
  // something anyone wants left on a live page.
  redirect(`/admin/pages/${slug}/sections/${id}`);
}

/** Save edited content for one section. */
export async function saveSection(
  pageSlug: string,
  sectionId: string,
  rawJson: string,
): Promise<ActionResult> {
  await requireAdmin();
  const slug = assertPage(pageSlug);

  const [row] = await db
    .select()
    .from(sections)
    .where(and(eq(sections.id, sectionId), eq(sections.pageSlug, slug)))
    .limit(1);

  if (!row) return { ok: false, message: 'That section no longer exists.' };

  const entry = getSectionEntry(row.type);
  if (!entry) return { ok: false, message: `Unknown section type "${row.type}".` };

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawJson);
  } catch {
    return { ok: false, message: 'The form could not be read. Reload and try again.' };
  }

  const result = entry.schema.safeParse(parsedJson);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      errors[issue.path.join('.') || '(root)'] = issue.message;
    }
    return { ok: false, message: 'Some fields need attention.', errors };
  }

  await db
    .update(sections)
    .set({ data: sanitizeData(result.data) })
    .where(eq(sections.id, sectionId));

  revalidatePath(`/admin/pages/${slug}`);
  revalidatePage(slug);

  return { ok: true, message: 'Saved. The live page is updated.' };
}

export async function setSectionVisible(
  pageSlug: string,
  sectionId: string,
  visible: boolean,
) {
  await requireAdmin();
  const slug = assertPage(pageSlug);

  await db
    .update(sections)
    .set({ visible })
    .where(and(eq(sections.id, sectionId), eq(sections.pageSlug, slug)));

  revalidatePath(`/admin/pages/${slug}`);
  revalidatePage(slug);
}

export async function deleteSection(pageSlug: string, sectionId: string) {
  await requireAdmin();
  const slug = assertPage(pageSlug);

  await db
    .delete(sections)
    .where(and(eq(sections.id, sectionId), eq(sections.pageSlug, slug)));

  revalidatePath(`/admin/pages/${slug}`);
  revalidatePage(slug);
}

/**
 * Persist a new order. The editor sends the full id list in its new sequence;
 * rewriting every row's order from that list is simpler and less error-prone
 * than diffing, and the row count per page is tiny.
 */
export async function reorderSections(pageSlug: string, orderedIds: string[]) {
  await requireAdmin();
  const slug = assertPage(pageSlug);

  const existing = await db
    .select({ id: sections.id })
    .from(sections)
    .where(eq(sections.pageSlug, slug))
    .orderBy(asc(sections.order));

  const known = new Set(existing.map((r) => r.id));
  // Ignore anything that is not actually on this page — a stale tab must not be
  // able to move another page's sections.
  const ids = orderedIds.filter((id) => known.has(id));
  if (ids.length !== known.size) {
    return { ok: false, message: 'The section list changed. Reload and try again.' };
  }

  await Promise.all(
    ids.map((id, i) =>
      db
        .update(sections)
        .set({ order: (i + 1) * 10 })
        .where(and(eq(sections.id, id), eq(sections.pageSlug, slug))),
    ),
  );

  revalidatePath(`/admin/pages/${slug}`);
  revalidatePage(slug);

  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Page SEO                                                                    */
/* -------------------------------------------------------------------------- */

export async function savePageSeo(
  pageSlug: string,
  rawJson: string,
): Promise<ActionResult> {
  await requireAdmin();
  const slug = assertPage(pageSlug);

  let input: Record<string, unknown>;
  try {
    input = JSON.parse(rawJson);
  } catch {
    return { ok: false, message: 'The form could not be read. Reload and try again.' };
  }

  const text = (key: string, max: number) => {
    const value = String(input[key] ?? '').trim();
    return value ? value.slice(0, max) : null;
  };

  const title = String(input.title ?? '').trim();
  if (!title) return { ok: false, message: 'The page needs a title.' };

  await db
    .update(pages)
    .set({
      title: title.slice(0, 250),
      seoTitle: text('seoTitle', 200),
      seoDescription: text('seoDescription', 320),
      ogImage: text('ogImage', 500),
    })
    .where(eq(pages.slug, slug));

  revalidatePath(`/admin/pages/${slug}`);
  revalidatePage(slug);

  return { ok: true, message: `Saved. ${pathForPage(slug)} is updated.` };
}
