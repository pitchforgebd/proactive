/**
 * Image upload for the dashboard.
 *
 * Authenticated: the middleware only guards /admin/*, so this route checks the
 * session itself — an unauthenticated POST here would otherwise let anyone
 * write files to the server.
 */
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { storeUpload, UploadError } from '@/lib/uploads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, message: 'Not signed in.' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Expected a file upload.' },
      { status: 400 },
    );
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: 'No file was sent.' }, { status: 400 });
  }

  try {
    const stored = await storeUpload(file, 'images');
    return NextResponse.json({ ok: true, url: stored.url, name: stored.originalName });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 422 });
    }
    console.error('[upload] failed', error);
    return NextResponse.json(
      { ok: false, message: 'The upload could not be saved.' },
      { status: 500 },
    );
  }
}
