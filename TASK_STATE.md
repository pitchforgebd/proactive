# TASK_STATE — Proactive Trade International website

Last updated: 2026-09-04 — What We Offer uses featured **categories** (not products).

## Continuity (Cursor-primary)

| Artifact | Role |
|---|---|
| `.cursor/rules/project.mdc` | Permanent always-on Cursor development rules |
| **`TASK_STATE.md` (this file)** | **Live progress tracker** |
| `docs/CPANEL_DEPLOYMENT.md` | **Deploy playbook** — Part 2 pre-flight + Part 4 battle-tested troubleshooting |

**Primary development environment: Cursor.**

---

## Deploy reminder (production)

Before every update: **Stop Node app** → activate `nodevenv` → kill stray `next-server` → ensure `node_modules` is a **symlink** → `NODE_ENV=development npm install --include=dev` → `npm run build` → copy static/public into standalone → Start app. Schema: phpMyAdmin SQL preferred over hanging `db:push`. Details: `docs/CPANEL_DEPLOYMENT.md` Part 2–4.

---

## Latest product work

| Item | Status |
|---|---|
| Mobile hero, justify text, partners colour, logo/footer text, WhatsApp float, admin toasts | DONE |
| What We Offer = featured **categories** (Featured checkbox moved off products) | DONE — needs DB column |

---

## Exact next action

1. Local/prod MySQL: `ALTER TABLE categories ADD COLUMN featured tinyint(1) NOT NULL DEFAULT 0;` (drop `products.featured` if it exists).
2. Admin → Categories → check **Featured on home** for ones that should appear.
3. Deploy when ready per `docs/CPANEL_DEPLOYMENT.md`.
