import { NextResponse } from 'next/server';
import { careerSchema, resumeFileSchema } from '@/lib/validation';

/**
 * PHASE 2 ENDPOINT — career application intake (multipart).
 *
 * Today this validates the fields and the attached CV, then logs. The dashboard
 * team replaces the marked block with a file write to storage plus a
 * CareerApplication record holding the resulting resumeUrl.
 *
 * Deploy note: Mode A only. For Mode B point NEXT_PUBLIC_CAREER_ENDPOINT at a
 * PHP handler accepting the same multipart fields. See README.md.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
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

  // --- PHASE 2: store the file, then the record ---------------------------
  // const resumeUrl = await storeResume(resume.data);
  // await db.careerApplications.create({ data: { ...application, resumeUrl } });
  console.info('[career] application received', {
    position: application.position,
    email: application.email,
    resume: { name: resume.data.name, size: resume.data.size },
  });
  // ------------------------------------------------------------------------

  return NextResponse.json({ ok: true });
}
