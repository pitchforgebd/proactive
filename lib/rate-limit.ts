/**
 * Basic in-memory rate limiting for the public form endpoints
 * (PHASE2-BACKEND.md §10).
 *
 * Deliberately simple: a fixed window per IP per endpoint, held in the process.
 * The site runs as a single Node process on cPanel, so a shared store would be
 * infrastructure for no gain. It is a spam brake, not a security boundary — the
 * honeypot and zod validation do the real work.
 *
 * If the app is ever scaled to multiple processes this becomes per-process and
 * should move to the database or Redis.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

const hits = new Map<string, { count: number; resetAt: number }>();

/** Best-effort client IP behind cPanel/Passenger's proxy headers. */
function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export function rateLimit(request: Request, bucket: string): boolean {
  const now = Date.now();
  const key = `${bucket}:${clientIp(request)}`;
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });

    // Opportunistic cleanup so the map cannot grow without bound.
    if (hits.size > 500) {
      hits.forEach((v, k) => {
        if (now > v.resetAt) hits.delete(k);
      });
    }
    return true;
  }

  entry.count += 1;
  return entry.count <= MAX_PER_WINDOW;
}
