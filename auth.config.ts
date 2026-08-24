/**
 * EDGE-SAFE AUTH CONFIG.
 *
 * Split from auth.ts on purpose: middleware.ts runs on the Edge runtime, where
 * neither `mysql2` nor `bcryptjs` can load. This half holds only what the
 * middleware needs — the route guard and the JWT/session shape — so the
 * middleware can check a session without ever touching the database.
 *
 * The Credentials provider (which does need both) lives in auth.ts, which only
 * ever runs in the Node runtime.
 */
import type { NextAuthConfig } from 'next-auth';

export const LOGIN_PATH = '/admin/login';
export const ADMIN_HOME = '/admin';

export const authConfig = {
  // Signing key. Never sent to the client; the session cookie is httpOnly.
  secret: process.env.AUTH_SECRET,
  // cPanel is not Vercel: trust the host header the Node app is served behind.
  trustHost: true,

  pages: {
    signIn: LOGIN_PATH,
    error: LOGIN_PATH,
  },

  // JWT sessions: no session table, no per-request database read on /admin.
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },

  callbacks: {
    /**
     * The /admin guard. Runs in middleware for every matched path.
     *
     * Returning false makes Auth.js redirect to `pages.signIn` with a callbackUrl,
     * so an admin who is timed out lands back where they were after logging in.
     */
    authorized({ auth, request: { nextUrl } }) {
      const signedIn = Boolean(auth?.user);
      const onLoginPage = nextUrl.pathname === LOGIN_PATH;

      if (onLoginPage) {
        // Already signed in? The login form has nothing to offer.
        if (signedIn) return Response.redirect(new URL(ADMIN_HOME, nextUrl));
        return true;
      }

      return signedIn;
    },

    jwt({ token, user }) {
      // `user` is only present on the sign-in call; copy what the UI needs.
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = String(token.id);
      }
      return session;
    },
  },

  // Filled in by auth.ts. Kept empty here so this module stays Edge-safe.
  providers: [],
} satisfies NextAuthConfig;
