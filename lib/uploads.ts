/**
 * FILE UPLOADS — persistent storage outside the build (PHASE2-BACKEND.md §8).
 *
 * CRITICAL: uploads must never be written into public/. With
 * `output: 'standalone'` that directory is replaced on every deploy, so
 * anything stored there is destroyed the next time the site ships. Files go to
 * UPLOAD_DIR — a sibling of the app that deploy.sh never touches — and the
 * database stores the relative URL served by app/api/files/[...path].
 *
 * Everything written here is validated first: extension, declared MIME type and
 * size, all against a whitelist. Filenames are generated, never taken from the
 * client, so a crafted name cannot escape the directory or overwrite anything.
 */
import 'server-only';

import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/** Where uploaded files live on disk. Absolute in production. */
export function uploadRoot(): string {
  const configured = process.env.UPLOAD_DIR?.trim() || './uploads';
  return path.resolve(process.cwd(), configured);
}

export type UploadKind = 'images' | 'resumes';

interface KindRule {
  /** extension → allowed MIME types */
  types: Record<string, string[]>;
  maxBytes: number;
  label: string;
}

const RULES: Record<UploadKind, KindRule> = {
  images: {
    types: {
      '.jpg': ['image/jpeg'],
      '.jpeg': ['image/jpeg'],
      '.png': ['image/png'],
      '.webp': ['image/webp'],
      '.avif': ['image/avif'],
      // SVG is rejected on purpose: uploaded SVG can carry script and is an XSS
      // vector when served as image/svg+xml (PHASE2-BACKEND.md §14).
    },
    maxBytes: 5 * 1024 * 1024,
    label: 'JPG, PNG, WebP or AVIF up to 5MB',
  },
  resumes: {
    types: {
      '.pdf': ['application/pdf'],
      '.doc': ['application/msword'],
      '.docx': [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    },
    maxBytes: 10 * 1024 * 1024,
    label: 'PDF, DOC or DOCX up to 10MB',
  },
};

export function uploadRule(kind: UploadKind): KindRule {
  return RULES[kind];
}

/** Content-type for serving a stored file, by extension. Unknown → download. */
export function contentTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  for (const rule of Object.values(RULES)) {
    const types = rule.types[ext];
    if (types) return types[0];
  }
  return 'application/octet-stream';
}

export interface StoredFile {
  /** Relative URL to store in the database, e.g. /api/files/images/ab12….png */
  url: string;
  /** Path relative to the upload root, e.g. images/ab12….png */
  relativePath: string;
  bytes: number;
  originalName: string;
}

export class UploadError extends Error {}

/**
 * Validate and store one uploaded file.
 *
 * Throws UploadError with a message safe to show the user; anything else is a
 * genuine server fault and should surface as a 500.
 */
export async function storeUpload(
  file: File,
  kind: UploadKind,
): Promise<StoredFile> {
  const rule = RULES[kind];

  if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) {
    throw new UploadError('No file was received.');
  }

  if (file.size > rule.maxBytes) {
    throw new UploadError(
      `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. Limit: ${rule.label}.`,
    );
  }

  const ext = path.extname(file.name).toLowerCase();
  const allowedTypes = rule.types[ext];

  if (!allowedTypes) {
    throw new UploadError(`${ext || 'That file type'} is not allowed. ${rule.label}.`);
  }

  // Both the extension and the browser-declared type must be on the list; a
  // mismatch means the file is not what it claims to be.
  if (file.type && !allowedTypes.includes(file.type)) {
    throw new UploadError(`That file's type (${file.type}) does not match ${ext}.`);
  }

  // Generated name: the client's filename never reaches the filesystem, so it
  // cannot contain a path separator, a traversal sequence, or a collision.
  const safeName = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}${ext}`;
  const relativePath = `${kind}/${safeName}`;
  const destination = path.join(uploadRoot(), kind, safeName);

  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await file.arrayBuffer()));

  return {
    url: `/api/files/${relativePath}`,
    relativePath,
    bytes: file.size,
    originalName: file.name,
  };
}

/**
 * Resolve a request path under the upload root, refusing anything that escapes
 * it. Returns null when the path is not safe.
 */
export function resolveStoredPath(segments: string[]): string | null {
  if (segments.length === 0) return null;
  // Reject traversal and absolute segments before they reach path.join.
  if (segments.some((s) => !s || s === '.' || s === '..' || s.includes('\\') || s.includes('/'))) {
    return null;
  }

  const root = uploadRoot();
  const target = path.resolve(root, ...segments);

  // Final containment check — the authoritative one.
  const rel = path.relative(root, target);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;

  return target;
}
