import { randomBytes } from 'node:crypto';

import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { notifyContactMessage } from '@/lib/mail';
import { rateLimit } from '@/lib/rate-limit';
import { contactMessages } from '@/lib/schema';
import { contactSchema } from '@/lib/validation';

/**
 * PHASE 2 ENDPOINT — contact form intake.
 *
 * Validates, rate-limits, then inserts into contact_messages, where the
 * dashboard inbox reads it. Optionally emails the company inbox when SMTP_*
 * is configured (PHASE2-BACKEND.md §10). Request/response shapes match Phase 1.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!rateLimit(request, 'contact')) {
    return NextResponse.json(
      { ok: false, message: 'Too many messages just now. Try again in a minute.' },
      { status: 429 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Send the form as JSON.' },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Some fields need attention.',
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  // Honeypot filled = bot. Answer 200 so it learns nothing.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { website: _honeypot, ...message } = parsed.data;

  try {
    await db.insert(contactMessages).values({
      id: randomBytes(16).toString('hex'),
      name: message.name,
      email: message.email,
      phone: message.phone || null,
      subject: message.subject,
      message: message.message,
    });
  } catch (error) {
    // Never leak a database error to a public form; log it and say something
    // the visitor can act on.
    console.error('[contact] insert failed', error);
    return NextResponse.json(
      { ok: false, message: 'We could not save your message. Please call us instead.' },
      { status: 500 },
    );
  }

  // After a successful save only — notify* never throws; mail failure must
  // not change this 200 response into a DB-looking error.
  await notifyContactMessage(message);

  return NextResponse.json({ ok: true });
}
