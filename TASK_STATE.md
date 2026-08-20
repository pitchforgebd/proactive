# TASK_STATE — Proactive Trade International website

Last updated: 2026-08-19 — **Phase 2 planning/audit complete. No Phase 2 code written.**

- Spec: `CLAUDE.md` (source of truth for Phase 1)
- Phase 2 audit + architecture + roadmap: **`PHASE2_PLAN.md`** ← read this before any backend work
- Deploy runbook, theming, motion and performance detail: `README.md`
- Original backend contract (now partly superseded — see below): `HANDOFF.md`

---

## Phase 1 — frontend: COMPLETE

Steps 1–10 of CLAUDE.md §12 are done. Verified 2026-08-18:

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npx next lint` | no warnings or errors |
| `npx next build` (Mode A, `DEPLOY_MODE=node`) | 39 routes, **87.3 kB** shared first-load JS |
| `DEPLOY_MODE=static npx next build` (Mode B) | clean, emits `out/` (188 files, incl. sitemap + robots) |
| All 14 routes over HTTP | 200; unknown path → 404 |
| `POST /api/contact` | valid → 200, invalid → 422, honeypot → 200 silent discard |
| `POST /api/career` (multipart) | valid → 200, missing CV → 422, wrong file type → 422 |
| Prerendered `/` HTML | `<h1>` server-rendered; 0 Google Font links; 0 eager iframes |

**Still not measured:** Lighthouse (mobile) against a production build with real
images — §5 targets (LCP < 2.0s, CLS < 0.05, Perf ≥ 90) are structurally in place
but unverified. Carried into Phase 2I.

### What exists

- **14 routes** + `sitemap.ts`, `robots.ts`, `not-found.tsx`, 3 `loading.tsx`, and
  `app/api/{contact,career}/route.node.ts`.
- **Components** — layout, ui, motion (11), media, forms, home, products.
- **Data layer** — `lib/data/index.ts` (public API), `lib/data/remote.ts` (Phase 2
  swap-in), `lib/data/mock/*` (6 fixtures), `lib/types.ts`, `lib/validation.ts`,
  `lib/nav.ts`, `lib/utils.ts`, `lib/gsap.ts`.
- **Assets** — 69 generated placeholder PNGs (`npm run gen:images`).
- **Features built after the initial sign-off:** header overflow fix at `xl`
  (phone number removed from the header only), light/dark theme with a split
  adaptive/band token system, a six-effect GSAP + pointer motion pass, and the
  home Solutions (8 tiles) + Capabilities sections. Full write-ups in `README.md`.

### Decisions worth knowing before touching Phase 1 code

1. **API routes are `route.node.ts`, not `route.ts`.** Static export cannot serve
   POST handlers and fails the build; `pageExtensions` in `next.config.js`
   registers them in Mode A and omits them in Mode B. (Phase 2 retires Mode B and
   renames these back.)
2. **The honeypot field is deliberately permissive in zod** so the handler can
   answer `200 {"ok":true}` and discard silently. Rejecting it would return 422 and
   tell the bot which field caught it.
3. **Framer Motion is loaded only by the lightbox** (`dynamic(..., {ssr:false})`).
   Scroll reveals use a bare IntersectionObserver — do not unify them onto
   `whileInView`; that puts an animation runtime in the shared bundle.
4. **The hero headline is CSS-only, not JS.** `RegistrationHero` is a Server
   Component and is the LCP element — keep it off the JavaScript path.
5. **Only `RichText` may use `dangerouslySetInnerHTML`** (DOMPurify sanitized). The
   JSON-LD `<script>` blocks are the deliberate exception.
6. **GSAP was added on explicit request** (CLAUDE.md §1 fixes the stack as Framer
   Motion + CSS). It is lazy, viewport-gated, and never downloaded under
   `prefers-reduced-motion`. Shared bundle unchanged at 87.3 kB.
7. **Dev server gotcha:** never run `next build` while `next dev` is live against
   the same `.next`. If dev misbehaves: kill port 3000, `rm -rf .next`, `npm run dev`.

### Outstanding Phase 1 items (need the client, not code)

- [ ] Replace all 69 placeholder images with real photography **at the same
      dimensions** (manifest at the bottom of `scripts/generate-placeholders.mjs`).
      Partner logos and the 8 solution tiles are the most visible.
- [ ] Review blocks marked **FOR CLIENT REVIEW** in `lib/data/mock/content.ts`:
      Global Sourcing narrative, Our Story timeline, Company profile.
- [ ] Confirm parent-company block: legal entity name, relationship wording, URL,
      real logo (currently assumed as Zexora from the old site's menu).
- [ ] Real YouTube video IDs (`lib/data/mock/media.ts` holds public placeholders).
- [ ] Company profile PDF (the `/company` page has a request-by-email CTA standing in).
- [ ] Confirm `aboutBody` matches the client's full verbatim copy.

---

## Phase 2 — dynamic site + admin dashboard: PLANNING COMPLETE, NOT STARTED

Full audit, content inventory, schema, API/auth/media design, questions and the
2A–2J roadmap are in **`PHASE2_PLAN.md`**. Summary of what that audit established:

### Discovered architecture / state

- The site is deployed on **Netlify as a static export**, not the cPanel target
  CLAUDE.md §3 assumed. Static export cannot run route handlers, ISR, Server
  Actions, sessions or a database — **every Phase 2 capability needs a Node runtime.**
- Consequently `/api/contact` and `/api/career` **do not exist on the live deploy**
  (`pageExtensions` drops `route.node.ts` in static mode) unless
  `NEXT_PUBLIC_*_ENDPOINT` was pointed at an external handler in the Netlify UI.
  **Treat as a possible live bug — verify first.**
- `HANDOFF.md` assumes a separate API on another host. If site + admin become one
  Next app, `lib/data` should query the database directly server-side; `remote.ts`
  becomes a fallback, not the primary path.
- **11 files bypass `lib/data`** and import `lib/data/mock/content.ts` (or hardcode
  content) directly — they are the frontend work of Phase 2. Pages already on
  `lib/data` need no changes.
- The mock fixtures are **not** a schema: gallery albums, product images, product
  specs and every ordered list need their own tables.
- `CLAUDE.md` §8 names **Summernote**, which is jQuery-based and contradicts §1's
  no-jQuery rule. TipTap is the recommended replacement — needs sign-off.
- `globalSourcing.pillars` picks icons **by array index**; icons must become stored
  fields or reordering silently changes them.

### Confirmed requirements

- ~25 tables across catalogue, editorial, page/section content, settings, media,
  form inboxes, and auth/ops (`PHASE2_PLAN.md` §2.1).
- Structured-forms admin over a **fixed layout — no page builder** (CLAUDE.md §11).
- Public reads direct from the DB; admin mutations via Server Actions; public POST
  shapes frozen exactly as in `HANDOFF.md` §3.
- Role-based auth (admin/editor/viewer), DB-backed sessions, argon2id.
- Media library with a storage abstraction (local + S3 drivers); CVs stored
  **privately** and served only through an authenticated admin route.
- Redirects table — slugs become editable, so URL breakage is otherwise guaranteed.
- `lib/types.ts` field names stay frozen; DB→frontend mapping lives in `lib/data/db.ts`.

### Recommended stack (pending the decisions below)

One Next.js app (site + `/admin`) on a Node runtime · PostgreSQL (or MySQL if
cPanel) · Prisma · Auth.js v5 credentials + DB sessions · Server Actions ·
TipTap · S3-compatible storage (R2) with a local driver · Vercel or Netlify-with-
Next-runtime or cPanel Node. Rejected: headless CMS as default (but **evaluate
Payload 3 once, first**), separate PHP API, any page builder, static export.

### Unresolved questions (full list + reasoning in `PHASE2_PLAN.md` §5)

**Blocking:** Q-H1 where Phase 2 runs · Q-H2 where the DB lives and whether the app
can reach it · Q-T7 is static export retired · Q-H8 do the live forms work today.

**Shapes the schema, so answer before 2A:** Q-C3 second language ever? ·
Q-C4 do Solutions get their own pages? · Q-C6 do applications attach to an opening? ·
Q-C5 per-product quote requests? · Q-C7 news tags/authors/pagination? ·
Q-C1 how many editors and roles? · Q-C2 draft/preview/scheduling?

**Decide before 2C:** Q-T1b evaluate Payload 3 vs hand-built admin · Q-T5 TipTap
vs Summernote · Q-T2/Q-T3 Postgres+Prisma vs alternatives · Q-C10 editable nav?

**Operational:** Q-C11 notification mailboxes + SMTP · Q-C12 CV retention ·
Q-C13 content migration from WordPress · Q-H3–Q-H7 admin domain, backups,
staging, CI/CD, budget · Q-T10 testing bar.

### Recommended implementation order

2A database → 2B auth → 2C admin foundation (prove one vertical slice) →
2D media → then 2E catalogue / 2F editorial / 2G page content in parallel →
2H forms & inboxes → 2I hardening + the outstanding Lighthouse run → 2J deploy.
Each phase's tasks, files, risks and exit criteria: `PHASE2_PLAN.md` §6.

---

## Exact next action

**No code. Two things, in this order:**

1. **Verify whether the live Netlify site's contact and career forms actually
   submit anywhere** (Q-H8). If not, that is a production bug losing enquiries and
   should be fixed independently of Phase 2.
2. **Answer the blocking questions** — Q-H1 (hosting), Q-H2 (database location),
   Q-T7 (retire static export) — plus the schema-shaping client questions
   (Q-C1–Q-C7). Phase 2A cannot start without them; everything after 2A depends on
   the schema those answers produce.

Once answered, the first commit is Phase 2A: the schema plus `lib/data/db.ts`,
seeded from the existing mocks, with the exit test being "`DATA_SOURCE=db` renders
every page identically to `mock`."
