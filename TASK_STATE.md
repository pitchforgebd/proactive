# TASK_STATE — Proactive Trade International website

Last updated: 2026-08-29 — **Phase 11 DONE** (Final SEO integration & testing).

## Continuity (Cursor-primary)

| Artifact | Role |
|---|---|
| `.cursor/rules/project.mdc` | Permanent always-on Cursor development rules |
| **`TASK_STATE.md` (this file)** | **Live progress tracker** |
| `docs/*` | Verified architecture / development / deployment / changelog |

**Primary development environment: Cursor.**

---

## Approved improvements track (2026-08-29) — COMPLETE (1–6)

| Phase | Scope | Status |
|---|---|---|
| 1–6 | Logo, contrast, Products label, sitemap, SMTP, readiness | DONE |

---

## SEO track — COMPLETE (7–11)

| Phase | Scope | Status |
|---|---|---|
| **7** | SEO settings foundation (DB + admin + data layer) | DONE 2026-08-29 |
| **8** | Public `<head>` + Verification & Head Tags | DONE 2026-08-29 |
| **9** | Sitemap core (DB-driven public `/sitemap.xml`) | DONE 2026-08-29 |
| **10** | Sitemap admin UI (Settings → Sitemap) | DONE 2026-08-29 |
| **11** | Final SEO integration & testing | **DONE 2026-08-29** |

### Phase 11 audit checklist (7–10)

| # | Item | Result |
|---|---|---|
| 1 | Verification & Head Tags admin UI | PASS — Settings → General fieldset |
| 2 | Google verification | PASS — meta when set; omitted when empty |
| 3 | Bing verification | PASS — `msvalidate.01` |
| 4 | GA4 | PASS — loads only with valid `G-…` ID |
| 5 | GTM | PASS — loads only with valid `GTM-…` ID |
| 6 | Meta / Facebook Pixel | PASS — loads only with numeric ID |
| 7 | Facebook domain verification | PASS |
| 8 | Yandex | PASS |
| 9 | Pinterest | PASS |
| 10 | Ahrefs | PASS |
| 11 | Custom head security | PASS — meta/link only; scripts stripped |
| 12 | Sitemap | PASS — dynamic `/sitemap.xml`, 34 public URLs |
| 13 | robots.txt | PASS — disallow `/admin/`, `/api/`; Sitemap URL set |
| 14 | Public URL generation | PASS — `NEXT_PUBLIC_SITE_URL` via `absoluteUrl` |
| 15 | Published vs unpublished | PASS — future news + orphan products excluded; no draft columns in schema |
| 16 | Admin/private exclusion | PASS — sitemap + robots |
| 17 | Sitemap / site URL config | PASS — same origin as metadata |

**Also verified:** no duplicate verification `<meta>` tags; custom scripts not executed; root OG/title preserved; SMTP notify still wired on contact/career; nav label remains **Products**; analytics only on public `(site)` layout (not admin).

**Note:** Admin save revalidates the layout so verification/analytics appear promptly. Direct DB edits without revalidation may wait for ISR (`revalidate = 60`).

### Phase 11 validation commands

- `npx tsx scripts/check-seo-head.ts` — PASS
- `npx tsx scripts/check-sitemap.ts` — PASS
- `npx tsx scripts/check-sitemap-admin.ts` — PASS
- `npm run check` — PASS
- `npm run build` — PASS (`/sitemap.xml`, `/robots.txt`, `/admin/settings`, `/admin/settings/sitemap`)
- `npx tsx scripts/smoke-sitemap-xml.ts` — PASS (34 URLs)
- `npx tsx scripts/smoke-seo-public-head.ts` — PASS (dev server; set/clear/restore)

No application feature changes in Phase 11 (smoke harness only: base URL arg + meta-tag duplicate check).

---

## Exact next action

**SEO track complete.** Await approval for any further work.

### Remaining production configuration (ops — not SEO code)

- Set production `NEXT_PUBLIC_SITE_URL` to the live canonical origin (not localhost)
- Paste real verification / GA4 / GTM / Pixel IDs in **Admin → Settings** (General)
- Configure production `SMTP_*` if form email notifications are required
- cPanel Mode A deploy (`output: 'standalone'`)
- Client assets / FOR CLIENT REVIEW copy / Lighthouse pass as needed
