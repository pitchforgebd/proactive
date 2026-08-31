import { randomBytes } from 'node:crypto';

import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { notifyCareerApplication } from '@/lib/mail';
import { rateLimit } from '@/lib/rate-limit';
import { careerApplications } from '@/lib/schema';
import { storeUpload, UploadError } from '@/lib/uploads';
import { careerSchema, resumeFileSchema } from '@/lib/validation';

/**
 * PHASE 2 ENDPOINT — career application intake (multipart).
 *
 * Validates fields + CV, stores the resume privately, inserts into
 * career_applications, and optionally emails the company inbox when SMTP_* is
 * configured (PHASE2-BACKEND.md §10).
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!rateLimit(request, 'career')) {
    return NextResponse.json(
      { ok: false, message: 'Too many submissions just now. Try again in a minute.' },
      { status: 429 },
    );
  }

  let form: FormData;

  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Send the application as multipart form data.' },
      { status: 400 },
    );
  }

  const parsed = careerSchema.safeParse({
    fullName: form.get('fullName'),
    email: form.get('email'),
    phone: form.get('phone'),
    position: form.get('position'),
    coverLetter: form.get('coverLetter'),
    website: form.get('website') ?? '',
  });

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

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const resume = resumeFileSchema.safeParse(form.get('resume'));

  if (!resume.success) {
    return NextResponse.json(
      {
        ok: false,
        message: resume.error.issues[0]?.message ?? 'Attach a valid CV.',
      },
      { status: 422 },
    );
  }

  const { website: _honeypot, ...application } = parsed.data;

  // Store the CV first: a record pointing at a file that failed to save would
  // be worse than no record at all.
  let resumeUrl: string;
  try {
    const stored = await storeUpload(resume.data, 'resumes');
    // CVs are private — the inbox serves them through the authenticated route.
    resumeUrl = `/api/admin/resume/${stored.relativePath}`;
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 422 });
    }
    console.error('[career] resume storage failed', error);
    return NextResponse.json(
      { ok: false, message: 'We could not save your CV. Please email it to us instead.' },
      { status: 500 },
    );
  }

  try {
    await db.insert(careerApplications).values({
      id: randomBytes(16).toString('hex'),
      fullName: application.fullName,
      email: application.email,
      phone: application.phone || null,
      position: application.position || null,
      coverLetter: application.coverLetter,
      resumeUrl,
    });
  } catch (error) {
    console.error('[career] insert failed', error);
    return NextResponse.json(
      { ok: false, message: 'We could not save your application. Please try again.' },
      { status: 500 },
    );
  }

  // DB row is already saved. notify* is no-op without SMTP and never throws.
  await notifyCareerApplication(application);

  return NextResponse.json({ ok: true });
}
