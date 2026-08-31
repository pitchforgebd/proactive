# Development

Local development guide for the Proactive Trade International site. Verified **2026-08-29**.

## Primary environment

**Cursor is the primary development environment.** Prior work used Claude Code; continuity for agents and humans is:

| Artifact | Role |
|---|---|
| `.cursor/rules/project.mdc` | Always-on Cursor rules |
| `TASK_STATE.md` | Live progress / next action (update after each phase) |
| `docs/*` | Verified architecture, deploy, changelog |
| `CLAUDE.md` / `PHASE2-BACKEND.md` | Historical Spec of Record (keep) |

## Prerequisites

- Node.js 18+ (20 LTS preferred for cPanel parity)
- MySQL 8.x (Laragon local is fine)
- Copy `.env.example` → `.env` and fill DB + `AUTH_SECRET`

Generate a secret:

```bash
openssl rand -base64 32
```

## Install & run

```bash
npm install
npm run db:push          # apply Drizzle schema to MySQL
npm run db:seed          # pages, sections, collections, admin user
npm run dev              # http://localhost:3000
```

Admin: `http://localhost:3000/admin/login` (credentials from seed / `ADMIN_EMAIL` + `ADMIN_PASSWORD`).

Useful scripts:

| Script | Purpose |
|---|---|
| `npm run check` | typecheck + lint + section registry + revalidation audit |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:studio` | Drizzle Studio |
| `npm run db:status` | Quick DB connectivity / counts |
| `npm run create-admin` | Add an admin user |
| `npm run gen:images` | Regenerate abstract CMYK placeholder PNGs under `public/images` |
| `npm run demo:images` | Download real Unsplash demo photos into the same paths (cards/sliders/products) |

## Environment variables

See `.env.example`. Required for app + admin:

- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (optional `DB_PORT`)
- `AUTH_SECRET`, `NEXTAUTH_URL`
- `UPLOAD_DIR` (local default often `./uploads`)
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CONTACT_ENDPOINT`, `NEXT_PUBLIC_CAREER_ENDPOINT` (default `/api/contact`, `/api/career`)

Optional SMTP (forms still save without these):

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `SMTP_FROM`, `SMTP_TO` (optional overrides; recipient else Settings.email)

Never commit `.env`. Uploads directory is gitignored.

## Project layout (working set)

```
app/(site)/          public routes
app/admin/           dashboard
app/api/             route handlers
components/          layout, ui, sections, admin, forms, motion, media
lib/data/            public content API (remote → MySQL)
lib/sections/        section registry / schemas / loaders
lib/schema.ts        Drizzle tables
lib/admin/           collection + settings Server Actions
scripts/             seed, checks, create-admin
uploads/             local persistent uploads (gitignored)
docs/                continuity documentation
```

## Coding conventions

1. **Server Components by default.** `"use client"` only for interactivity (nav, forms, admin widgets, motion).
2. **Content through `lib/data`.** No Drizzle or mock imports in page/section UI.
3. **Sanitize rich HTML** with `sanitizeHtml` before store; render via `<RichText />`.
4. **Validate** section `data` and forms with zod.
5. **Revalidate** after writes using `lib/revalidate.ts` helpers.
6. **Images:** `next/image` with sizes; no SVG admin uploads.
7. **Match existing style** in the file you edit; no drive-by refactors.
8. Do not add Prisma, a second CMS, page builders, Bootstrap, or jQuery on the public site.

## Adding a section type

1. Prop-driven component in `components/sections/`
2. Zod schema in `lib/sections/schemas.ts`
3. Register in `lib/sections/registry.ts` (label, group, defaults)
4. Lazy loader in `lib/sections/components.ts`
5. `npm run check:sections`

## Adding a marketing page

1. Add slug to `PAGE_SLUGS` / maps in `lib/pages.ts`
2. Add `app/(site)/…/page.tsx` using `getPage` + `SectionRenderer`
3. Seed default sections (`scripts/seed-pages.ts` / seed)
4. Ensure revalidation path map covers the new route

## Dev gotchas

- Do not run `next build` while `next dev` shares the same `.next` folder. If the app misbehaves: stop dev, delete `.next`, `npm run dev`.
- Hot reload can open extra MySQL connections; keep `connectionLimit` ≤ 5.
- Middleware must not import `auth.ts` (mysql2/bcrypt) — only `auth.config.ts`.

## Workflow for Cursor agents

1. Read `TASK_STATE.md` for the exact next action.
2. Confirm scope with the user if ambiguous; one phase at a time.
3. Inspect existing code before editing.
4. Implement; run `npm run check`; fix regressions from your change.
5. Update `TASK_STATE.md` and append to `docs/CHANGELOG.md`.
6. Stop and wait for approval before the next phase.

## Tests / checks

There is no large unit/e2e suite. The gate is:

```bash
npm run check
```

That is the required validation before calling a documentation or code phase complete.
