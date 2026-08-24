'use server';

import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidateSettings } from '@/lib/revalidate';
import { careerApplications, contactMessages, settings } from '@/lib/schema';

/** Settings + inbox actions. */

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Not authorised.');
}

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === '' || /^https?:\/\//i.test(v), 'Use a full https:// address.');

const settingsInput = z.object({
  companyName: z.string().trim().min(1, 'The company name is required.').max(200),
  phone: z.string().trim().max(40),
  email: z.string().trim().email('That is not a valid email address.').max(200),
  address: z.string().trim().max(400),
  mapQuery: z.string().trim().max(400),
  facebook: optionalUrl,
  linkedin: optionalUrl,
  instagram: optionalUrl,
  youtube: optionalUrl,
});

export interface SettingsResult {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

/**
 * Global settings feed the header, footer, contact page and every CTA band, so
 * a save revalidates the whole layout rather than one path.
 */
export async function saveSettings(rawJson: string): Promise<SettingsResult> {
  await requireAdmin();

  let input: unknown;
  try {
    input = JSON.parse(rawJson);
  } catch {
    return { ok: false, message: 'The form could not be read. Reload and try again.' };
  }

  const parsed = settingsInput.safeParse(input);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join('.')] = issue.message;
    return { ok: false, message: 'Some fields need attention.', errors };
  }

  const values = parsed.data;
  const [existing] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);

  if (existing) {
    await db.update(settings).set(values).where(eq(settings.id, 1));
  } else {
    await db.insert(settings).values({ id: 1, ...values });
  }

  revalidateSettings();
  revalidatePath('/admin/settings');

  return { ok: true, message: 'Saved. The header, footer and contact page are updated.' };
}

/* -------------------------------------------------------------------------- */
/* Inboxes                                                                     */
/* -------------------------------------------------------------------------- */

export async function markRead(kind: 'career' | 'contact', id: string, read: boolean) {
  await requireAdmin();
  const table = kind === 'career' ? careerApplications : contactMessages;
  await db.update(table).set({ read }).where(eq(table.id, id));
  revalidatePath(`/admin/${kind}`);
}

export async function deleteSubmission(kind: 'career' | 'contact', id: string) {
  await requireAdmin();
  const table = kind === 'career' ? careerApplications : contactMessages;
  await db.delete(table).where(eq(table.id, id));
  revalidatePath(`/admin/${kind}`);
}

/** Newest first — an inbox is read from the top. */
export async function listSubmissions(kind: 'career' | 'contact') {
  await requireAdmin();
  return kind === 'career'
    ? db.select().from(careerApplications).orderBy(desc(careerApplications.createdAt))
    : db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}
