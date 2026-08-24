/**
 * Serves uploaded files from UPLOAD_DIR (PHASE2-BACKEND.md §8).
 *
 * Uploads live outside the build, so they are not reachable as static assets —
 * this route is the only way to read them. The path is resolved through
 * resolveStoredPath(), which refuses anything that escapes the upload root.
 *
 * Resumes are NOT served here: they are private, and go through the
 * authenticated admin route instead.
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { ReadableOptions } from 'node:stream';

import { NextResponse } from 'next/server';

import { contentTypeFor, resolveStoredPath } from '@/lib/uploads';

export const runtime = 'nodejs';

/** Only public asset kinds. Resumes are deliberately absent. */
const PUBLIC_KINDS = new Set(['images']);

function toWebStream(path: string, options?: ReadableOptions): ReadableStream<Uint8Array> {
  const nodeStream = createReadStream(path, options);
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) =>
        controller.enqueue(new Uint8Array(chunk as Buffer)),
      );
      nodeStream.on('end', () => controller.close());
      nodeStream.on('error', (error) => controller.error(error));
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: { path: string[] } },
) {
  const segments = params.path ?? [];

  if (!PUBLIC_KINDS.has(segments[0])) {
    return new NextResponse('Not found', { status: 404 });
  }

  const filePath = resolveStoredPath(segments);
  if (!filePath) return new NextResponse('Not found', { status: 404 });

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new NextResponse('Not found', { status: 404 });

    return new NextResponse(toWebStream(filePath), {
      headers: {
        'Content-Type': contentTypeFor(filePath),
        'Content-Length': String(info.size),
        // Filenames are content-addressed enough to cache hard: a changed image
        // is a new upload with a new name.
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
