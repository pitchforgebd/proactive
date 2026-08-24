/**
 * Drizzle client for CLI scripts (seed, status, create-admin).
 *
 * Separate from lib/db.ts because that module carries `server-only`, which
 * throws outside the React Server Components runtime. Both build their pool
 * from the same lib/db-config.ts, so there is one place to change connection
 * settings.
 *
 * Always `await close()` — a script that leaves the pool open never exits.
 */
import 'dotenv/config';

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import { poolOptions } from '../lib/db-config';
import * as schema from '../lib/schema';

export const pool = mysql.createPool(poolOptions());
export const db = drizzle(pool, { schema, mode: 'default' });
export { schema };

export async function close() {
  await pool.end();
}
