# Deployment

cPanel Node (Mode A) deployment for Proactive Trade International. Verified against `next.config.js`, `deploy.sh`, `.env.example`, and `PHASE2-BACKEND.md` §12 on **2026-08-29**.

> **Full step-by-step guide:** [`CPANEL_DEPLOYMENT.md`](./CPANEL_DEPLOYMENT.md)

## Target

| Item | Value |
|---|---|
| Hosting | cPanel **Setup Node.js App** (CloudLinux / Passenger), Node 18+ |
| Next output | `standalone` (hardcoded in `next.config.js`) |
| Database | MySQL on the same cPanel account |
| Static export | **Retired** — cannot run DB, sessions, Server Actions, or form APIs |

> **Note:** An older Netlify static export may still exist historically (`PHASE2_PLAN.md`). That mode cannot host Phase 2. Production for this codebase is Node standalone.

## First-time setup

1. **MySQL** — Create database + user; grant all on that DB. Record host/user/password/name.
2. **Node app** — Application root (e.g. `proactive-app`), startup file = standalone `server.js`, Node 20 LTS preferred.
3. **Persistent uploads** — Directory **outside** the build tree, e.g. `~/proactive-app-uploads` or a sibling of the app. Set `UPLOAD_DIR` to that absolute path. Never store uploads in `public/`.
4. **Environment** — Set in the Node app panel (and/or `.env` on the server):

```
NEXT_PUBLIC_SITE_URL=https://proactive.com.bd
DB_HOST=localhost
DB_PORT=3306
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
AUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://proactive.com.bd
UPLOAD_DIR=/home/USER/proactive-app-uploads
NEXT_PUBLIC_CONTACT_ENDPOINT=/api/contact
NEXT_PUBLIC_CAREER_ENDPOINT=/api/career
```

Optional mail (forms still save to DB if unset):

```
SMTP_HOST=mail.proactive.com.bd
SMTP_PORT=465
SMTP_USER=info@proactive.com.bd
SMTP_PASS=<mailbox password — never commit>
SMTP_FROM=info@proactive.com.bd
SMTP_TO=info@proactive.com.bd
```

Recipient priority in code: **Settings.email** → `SMTP_TO` → `SMTP_USER`.
Set the company email under `/admin/settings` so inbox alerts match the public contact address.
5. **Schema + seed** (SSH/terminal once):

```bash
cd ~/proactive-app   # or your app root
npm ci
npm run db:push
npm run db:seed      # prints admin password once if ADMIN_PASSWORD unset
```

6. **Build & wire standalone assets:**

```bash
npm run build
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

Point the Node app at the standalone `server.js` (Passenger sets `PORT` — do not hardcode).

7. **Domain + SSL** — Point the domain at the Node app. Enable HTTPS at the vhost; set **HSTS** there (not in Next config, so local HTTP keeps working).

8. Verify `/`, `/admin/login`, contact/career submit, and image upload.

## Repeatable deploy

Use `deploy.sh` on the server (uploads-safe — never deletes `UPLOAD_DIR`):

```bash
chmod +x deploy.sh   # once
./deploy.sh
```

What it does: `git pull` → `npm ci` → `npm run build` → copy `static` + `public` into `.next/standalone` → touch `tmp/restart.txt`.

Schema changes between deploys:

```bash
npm run db:generate
npm run db:migrate
# or, for simple push-based workflow on staging: npm run db:push
```

## Standalone packaging reminder

`output: 'standalone'` does **not** include `public/` or `.next/static` inside the standalone folder automatically. Both must be copied beside/into the standalone tree (as `deploy.sh` does) or CSS/images 404.

## Security checklist (production)

- [ ] Strong unique `AUTH_SECRET`
- [ ] `.env` / panel secrets not in git
- [ ] `UPLOAD_DIR` outside deploy clean paths
- [ ] HTTPS on the public hostname; HSTS at proxy/vhost
- [ ] Admin password rotated from any seed default
- [ ] SMTP credentials only if mail is required

Baseline app headers (already in `next.config.js`): `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.

## Rollback / ops notes

- Uploads and MySQL are the durable state; the standalone build is disposable.
- Restoring code: previous git revision + `./deploy.sh` (or manual build copy).
- Restoring content: MySQL dump + `UPLOAD_DIR` backup.
- Form spam: honeypot + per-process rate limit; mail outages do not block DB saves.

## Status

Live cPanel cutover for this repo is tracked in `TASK_STATE.md` and is **not** assumed complete until that file says so.
