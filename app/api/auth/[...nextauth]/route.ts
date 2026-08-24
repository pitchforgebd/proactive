/**
 * Auth.js endpoints (sign-in callback, session, CSRF).
 *
 * Node runtime: the credentials provider verifies bcrypt hashes against MySQL.
 */
import { handlers } from '@/auth';

export const runtime = 'nodejs';

export const { GET, POST } = handlers;
