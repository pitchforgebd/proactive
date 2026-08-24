/**
 * AUTH.JS — credentials sign-in for the dashboard (PHASE2-BACKEND.md §7).
 *
 * Node runtime only: it reads `admin_users` through Drizzle and verifies the
 * password with bcrypt. middleware.ts deliberately imports auth.config.ts
 * instead, so the Edge guard never pulls either of those in.
 *
 * Passwords are compared with bcrypt.compare against the stored hash — the
 * plaintext is never stored, logged, or returned.
 */
import { eq } from 'drizzle-orm';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { authConfig } from './auth.config';
import { db } from './lib/db';
import { adminUsers } from './lib/schema';

/** Shape of the login form. Anything else is rejected before touching the DB. */
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const [user] = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.email, email.toLowerCase().trim()))
          .limit(1);

        // Returning null for both "no such user" and "wrong password" keeps the
        // failure indistinguishable, so the form cannot be used to enumerate
        // which email addresses have accounts.
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
        };
      },
    }),
  ],
});
