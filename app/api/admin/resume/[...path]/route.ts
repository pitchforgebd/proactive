/**
 * Authenticated CV download.
 *
 * Resumes are personal data and are deliberately excluded from the public
 * /api/files route — they are only ever served here, to a signed-in admin.
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { contentTypeFor, resolveStoredPath } from '@/lib/uploads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { path: string[] } },
) {
  const session = await auth();
  if (!session?.user) return new NextResponse('Not found', { status: 404 });

  const segments = params.path ?? [];
  if (segments[0] !== 'resumes') return new NextResponse('Not found', { status: 404 });

  const filePath = resolveStoredPath(segments);
  if (!filePath) return new NextResponse('Not found', { status: 404 });

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new NextResponse('Not found', { status: 404 });

    const stream = createReadStream(filePath);
    const web = new ReadableStream({
      start(controller) {
        stream.on('data', (c) => controller.enqueue(new Uint8Array(c as Buffer)));
        stream.on('end', () => controller.close());
        stream.on('error', (e) => controller.error(e));
      },
      cancel() {
        stream.destroy();
      },
    });

    return new NextResponse(web, {
      headers: {
        'Content-Type': contentTypeFor(filePath),
        'Content-Length': String(info.size),
        'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
