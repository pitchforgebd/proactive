/**
 * drizzle-kit config. Reads the same .env the app does.
 *
 *   npm run db:push      — sync lib/schema.ts straight into the database (dev,
 *                          and the first cPanel install per PHASE2-BACKEND.md §12)
 *   npm run db:generate  — emit a SQL migration into ./drizzle (commit it)
 *   npm run db:migrate   — apply pending migrations (production schema changes)
 *   npm run db:studio    — browse the data
 */
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'mysql',
  schema: './lib/schema.ts',
  out: './drizzle',
  dbCredentials: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'proactive',
  },
  verbose: true,
  strict: false,
});
