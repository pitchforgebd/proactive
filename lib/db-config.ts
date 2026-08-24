/**
 * Connection options, shared by the app's pool (lib/db.ts) and the CLI scripts
 * (scripts/_db.ts).
 *
 * Deliberately free of `server-only` and of any React import: this module has
 * to be loadable from a plain Node process (seed, migrate, status) as well as
 * from the Next server. The `server-only` guard stays on lib/db.ts and
 * lib/data/remote.ts, which are the modules a Client Component could plausibly
 * import by mistake.
 */
import type { PoolOptions } from 'mysql2';

export function poolOptions(): PoolOptions {
  const { DB_HOST, DB_USER, DB_NAME } = process.env;

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error(
      'Database env vars missing. Set DB_HOST, DB_USER, DB_PASSWORD and DB_NAME ' +
        '(see .env.example / PHASE2-BACKEND.md §11).',
    );
  }

  return {
    host: DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: DB_USER,
    password: process.env.DB_PASSWORD ?? '',
    database: DB_NAME,
    // Keep small: shared MySQL caps concurrent connections per user.
    connectionLimit: 5,
    waitForConnections: true,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: 'Z',
  };
}
