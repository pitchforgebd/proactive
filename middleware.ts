/**
 * ADMIN ROUTE GUARD.
 *
 * Every /admin/* path except the login page requires a session; unauthenticated
 * requests are redirected to /admin/login with a callbackUrl (PHASE2-BACKEND.md §7).
 *
 * This imports auth.config.ts, NOT auth.ts. The middleware runs on the Edge
 * runtime, which cannot load mysql2 or bcryptjs — it only needs to verify the
 * signed session cookie, which is exactly what the Edge-safe config does.
 *
 * The matcher keeps the middleware off the public site entirely, so no
 * marketing page pays for it.
 */
import NextAuth from 'next-auth';

import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/admin/:path*'],
};
