# cPanel Deployment Guide

**Proactive Trade International** — Mode A only (Node.js standalone).

This is the practical walkthrough for putting the site live on cPanel.  
For a shorter ops summary see also [`DEPLOYMENT.md`](./DEPLOYMENT.md).

---

## Requirements

| Need | Details |
|---|---|
| cPanel | **Setup Node.js App** (CloudLinux / Passenger) |
| Node | **18+** (prefer **20 LTS**) |
| Database | MySQL on the same cPanel account |
| Access | File Manager or SSH; ability to set Node env vars |

**Not supported:** static export / upload-to-`public_html` only. This app needs a running Node process (DB, Auth, uploads API, ISR).

---

## Architecture (what you are deploying)

```
Browser → Domain → Passenger → .next/standalone/server.js (Next.js)
                                      ↓
                              MySQL (content + admin)
                                      ↓
                         UPLOAD_DIR (images / resumes — outside build)
```

- Build output: `output: 'standalone'` in `next.config.js`
- Uploads: **never** under `public/` (wiped on every deploy)
- Secrets: cPanel Node env panel and/or server `.env` (never commit)

---

## Part 1 — First-time setup

### 1. Create MySQL database

In cPanel → **MySQL Databases**:

1. Create a database (e.g. `cpaneluser_proactive`)
2. Create a user with a strong password
3. Add the user to the database with **ALL PRIVILEGES**
4. Note:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=cpaneluser_proactive
DB_PASSWORD=********
DB_NAME=cpaneluser_proactive
```

### 2. Create a persistent uploads folder

Create a directory **outside** the Node app build tree, for example:

```text
/home/CPANEL_USER/proactive-uploads
```

or a sibling folder next to the app that deploy never deletes.

You will set `UPLOAD_DIR` to that **absolute** path.

### 3. Upload / clone the application

Put the project files in the Node application root, e.g.:

```text
/home/CPANEL_USER/proactive-app
```

Prefer `git clone` / `git pull` if the host has SSH + git.  
Otherwise upload a release zip and extract into that folder.

### 4. Create the Node.js application (cPanel)

1. Open **Setup Node.js App**
2. **Create Application**:
   - Node version: **20** (or 18+)
   - Application root: `proactive-app` (path above)
   - Application URL: your domain (or subdomain)
   - Application startup file: see step 7 (after first build) — typically  
     `.next/standalone/server.js`
3. Click **Create**
4. Open **Environment variables** (or edit `.env` in the app root) and add the values in the next section
5. Run **NPM Install** from the panel (or `npm ci` via SSH)

### 5. Environment variables

Set these in the Node app panel (recommended) and/or a server `.env` (git-ignored).

**Required**

```env
NEXT_PUBLIC_SITE_URL=https://proactive.com.bd
NEXTAUTH_URL=https://proactive.com.bd

DB_HOST=localhost
DB_PORT=3306
DB_USER=cpaneluser_proactive
DB_PASSWORD=
DB_NAME=cpaneluser_proactive

# Generate: openssl rand -base64 32
AUTH_SECRET=

# Absolute path — outside the standalone build
UPLOAD_DIR=/home/CPANEL_USER/proactive-uploads

NEXT_PUBLIC_CONTACT_ENDPOINT=/api/contact
NEXT_PUBLIC_CAREER_ENDPOINT=/api/career
DEPLOY_MODE=node
```

**Optional — email notifications** (forms still save to the DB if unset)

```env
SMTP_HOST=mail.proactive.com.bd
SMTP_PORT=465
SMTP_USER=info@proactive.com.bd
SMTP_PASS=
SMTP_FROM=info@proactive.com.bd
SMTP_TO=info@proactive.com.bd
```

Mail recipient priority in code: **Admin → Settings → email** → `SMTP_TO` → `SMTP_USER`.

**Optional — first admin seed**

```env
ADMIN_EMAIL=admin@proactive.com.bd
ADMIN_PASSWORD=
```

If `ADMIN_PASSWORD` is empty, `npm run db:seed` generates one and prints it **once**.

### 6. Install, schema, seed (SSH or cPanel terminal)

```bash
cd ~/proactive-app

npm ci
npm run db:push
npm run db:seed
```

Save the printed admin password. Sign in later at `/admin/login`.

### 7. Build and attach static files

Standalone build does **not** automatically include `public/` or `.next/static`. Copy them in:

```bash
cd ~/proactive-app

npm run build

mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

Or run the project script (same steps + restart touch):

```bash
chmod +x deploy.sh
./deploy.sh
```

**Startup file** in Setup Node.js App:

```text
.next/standalone/server.js
```

Passenger sets `PORT` — do not hardcode a port.

Restart the Node app from the panel (or `touch tmp/restart.txt`).

### 8. Domain + SSL

1. Point the domain (or subdomain) at the Node application
2. Issue SSL (AutoSSL / Let’s Encrypt)
3. Force HTTPS at the vhost if available
4. Set **HSTS** on the proxy/vhost (not in Next.js config — keeps local HTTP working)

Confirm `NEXT_PUBLIC_SITE_URL` and `NEXTAUTH_URL` match the live HTTPS origin.

### 9. Smoke checks

| Check | URL / action |
|---|---|
| Home | `https://your-domain/` |
| Admin login | `/admin/login` |
| Contact form | Submit → row in Admin → Messages |
| Career form | Submit with CV → Admin → Applications |
| Image upload | Admin → Settings / product image → file under `UPLOAD_DIR` |
| Sitemap | `/sitemap.xml` |
| Robots | `/robots.txt` |

Then in **Admin → Settings**:

- Logo / favicon / footer QR (optional)
- Company contact + socials
- Verification & analytics IDs when ready
- Confirm email matches where you want form alerts

---

## Part 2 — Repeatable updates (later deploys)

From the app root on the server:

```bash
cd ~/proactive-app
./deploy.sh
```

`deploy.sh` does:

1. `git pull`
2. `npm ci`
3. `npm run build`
4. Copy `.next/static` + `public` into `.next/standalone`
5. Touch `tmp/restart.txt` (Passenger reload)

**Uploads directory is never deleted.**

### If the database schema changed

```bash
npm run db:push
# or, if you use migrations:
# npm run db:generate && npm run db:migrate
```

Do **not** re-run `db:seed` on production unless you intentionally want to reset seed content (seed is destructive for some tables).

---

## Part 3 — File layout reminder

```text
/home/CPANEL_USER/
  proactive-app/                 ← Node application root
    .next/standalone/
      server.js                  ← startup file
      .next/static/              ← copied after build
      public/                    ← copied after build
    deploy.sh
    .env                         ← optional; prefer panel env
  proactive-uploads/             ← UPLOAD_DIR (persistent)
```

---

## Part 4 — Troubleshooting

| Symptom | Likely cause |
|---|---|
| CSS / JS 404 | Forgot to copy `.next/static` into standalone |
| Images 404 for `/images/...` | Forgot to copy `public` into standalone |
| Uploaded images 404 | Wrong `UPLOAD_DIR`, or app not reading absolute path |
| Uploads disappear after deploy | Files were stored under `public/` — move to `UPLOAD_DIR` |
| Admin login fails / loops | `AUTH_SECRET` / `NEXTAUTH_URL` mismatch or wrong site URL |
| DB connection error | Wrong `DB_*`, user not granted on DB, wrong host |
| Blank page / 503 | Node app stopped; check panel logs; restart app |
| Forms save but no email | SMTP not set (OK by design) — check Admin inbox |

Logs: cPanel Node app → **stdout/stderr** / error log for the application.

---

## Part 5 — Security checklist

- [ ] Unique strong `AUTH_SECRET`
- [ ] No `.env` or passwords in git
- [ ] `UPLOAD_DIR` outside deploy wipe paths
- [ ] HTTPS live; rotate any seed default admin password
- [ ] SMTP password only if mail is required
- [ ] Restrict SSH / cPanel access to operators

App already sends baseline headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).

---

## Part 6 — Backup & rollback

| What | How |
|---|---|
| Code | Previous git commit + `./deploy.sh` |
| Content | MySQL dump |
| Media / CVs | Copy of `UPLOAD_DIR` |

The standalone build is disposable. **MySQL + uploads** are the durable state.

---

## Quick reference commands

```bash
# First time
npm ci && npm run db:push && npm run db:seed && npm run build
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# Later
./deploy.sh
```

---

*Aligned with `next.config.js`, `deploy.sh`, `.env.example`, and `docs/DEPLOYMENT.md`.*
