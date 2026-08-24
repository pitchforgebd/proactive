/**
 * MySQL connection for the Next.js server — server only (PHASE2-BACKEND.md §4).
 *
 * Shared hosting has a low `max_user_connections`, so this module keeps ONE
 * small pool per process and reuses it across dev hot-reloads. The size lives
 * in lib/db-config.ts; never raise it above 5 without checking the cPanel limit.
 *
 * `server-only` makes importing this from a Client Component a build error —
 * DB credentials must never reach the browser. CLI scripts use scripts/_db.ts
 * instead, which builds an equivalent pool from the same options.
 */
import 'server-only';

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import { poolOptions } from './db-config';
import * as schema from './schema';

const globalForDb = globalThis as unknown as { pool?: mysql.Pool };

export const pool = globalForDb.pool ?? mysql.createPool(poolOptions());

// Only cache on the global in dev — production has a single long-lived process,
// and caching there would keep a stale pool alive across a graceful restart.
if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

export const db = drizzle(pool, { schema, mode: 'default' });

export { schema };
