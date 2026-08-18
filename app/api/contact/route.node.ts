import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validation';

/**
 * PHASE 2 ENDPOINT — contact form intake.
 *
 * Today this validates and logs. The dashboard team replaces the marked block
 * with a database insert (ContactMessage) and a notification email; the request
 * and response shapes below are what the client form already depends on, so
 * they should not change.
 *
 * Deploy note: this route only exists in Mode A (Node). For Mode B (static
 * export) point NEXT_PUBLIC_CONTACT_ENDPOINT at a PHP handler that accepts the
 * same JSON body and returns the same shape. See README.md.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
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

  // --- PHASE 2: persist + notify -----------------------------------------
  // await db.contactMessages.create({ data: message });
  // await sendNotificationEmail(message);
  console.info('[contact] message received', {
    subject: message.subject,
    email: message.email,
  });
  // -----------------------------------------------------------------------

  return NextResponse.json({ ok: true });
}
