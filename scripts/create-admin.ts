/**
 * Create or reset a dashboard account —  npm run create-admin
 *
 * Usage:
 *   npm run create-admin                            uses ADMIN_EMAIL / ADMIN_PASSWORD
 *   npm run create-admin -- user@site.com secret123  explicit
 *
 * This is the recovery path when someone is locked out: there is no
 * self-service password reset, by design — the dashboard has a handful of
 * accounts and a public reset flow is more attack surface than it is worth.
 */
import 'dotenv/config';

import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { close, db, schema } from './_db';

async function main() {
  const [argEmail, argPassword] = process.argv.slice(2);

  const email = (argEmail || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = argPassword || process.env.ADMIN_PASSWORD || '';

  if (!email || !email.includes('@')) {
    throw new Error('Give an email: npm run create-admin -- you@example.com yourPassword');
  }
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [existing] = await db
    .select()
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(schema.adminUsers)
      .set({ passwordHash })
      .where(eq(schema.adminUsers.email, email));
    console.log(`Password reset for ${email}.`);
  } else {
    await db.insert(schema.adminUsers).values({
      id: `admin-${Date.now().toString(36)}`,
      email,
      passwordHash,
      name: 'Administrator',
    });
    console.log(`Created admin ${email}.`);
  }

  console.log('Sign in at /admin/login.');
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(close);
