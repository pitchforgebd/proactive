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

### Pre-flight (every time — avoids the failures we hit on bdix14)

1. **Stop** the Node app in cPanel → Setup Node.js App (frees LVE process slots).
2. SSH in and **activate the Node virtualenv** (plain SSH has no `npm`):

```bash
# Copy the exact line from the Node app panel if paths differ
source ~/nodevenv/proactive-app/20/bin/activate
cd ~/proactive-app
```

Prompt must show `[proactive-app (20)]` (or your Node version).

3. Kill leftover Next/Passenger workers (multiple `next-server` → `EAGAIN` / cagefs fork errors):

```bash
pkill -u $USER -f "next-server" || true
pkill -u $USER -f "next build" || true
pkill -u $USER -f "drizzle-kit" || true
ps -u $USER -o pid,cmd | grep -E 'node|next' | grep -v grep   # should be empty
```

4. Confirm `node_modules` is a **symlink** to the venv (never a real folder uploaded from local):

```bash
ls -la node_modules
# Expect: node_modules -> /home/.../nodevenv/proactive-app/20/lib/node_modules
```

If it is a real directory:

```bash
rm -rf node_modules
ln -s ~/nodevenv/proactive-app/20/lib/node_modules ~/proactive-app/node_modules
```

### Deploy commands (preferred)

```bash
chmod +x deploy.sh   # once, if Permission denied
bash deploy.sh       # or ./deploy.sh after chmod
```

`deploy.sh` (current):

1. `git pull`
2. `NODE_ENV=development npm install --include=dev` (devDeps required for `next build` — e.g. `tailwindcss`)
3. `npm run build` with low-memory env (`NODE_OPTIONS`, `RAYON_NUM_THREADS=1`)
4. Copy `.next/static` + `public` into `.next/standalone`
5. Touch `tmp/restart.txt`

Then cPanel → **Start** / **Restart** the Node app.

**Manual equivalent** (if `deploy.sh` is awkward):

```bash
git pull
export NODE_OPTIONS="--max-old-space-size=1536"
export RAYON_NUM_THREADS=1
export UV_THREADPOOL_SIZE=1
# AUTH_SECRET must be available to the build if any server code reads it
export AUTH_SECRET="…from panel…"

NODE_ENV=development npm install --include=dev --no-audit --no-fund
ls node_modules/tailwindcss/package.json   # must exist

npm run build

mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static
rm -rf .next/standalone/public
cp -r public .next/standalone/public
mkdir -p tmp && touch tmp/restart.txt
```

Startup file stays: `.next/standalone/server.js`.

### If the database schema changed

**Do not rely on interactive `drizzle-kit push` over jailshell** — it often hangs waiting for a prompt you cannot see.

**Preferred on this host:** phpMyAdmin → SQL → run the `ALTER TABLE … ADD COLUMN` statements for the new columns (safe additive changes). Duplicate-column errors mean that column is already there — skip it.

Optional CLI (may hang; Ctrl+C if stuck >2 min):

```bash
yes | npx drizzle-kit push --force
```

Do **not** run `db:seed` on production (destructive for content tables).

### After deploy — content checks

- Admin → Settings → **WhatsApp number** (floating button)
- Admin → Products → **Featured** (home What We Offer, up to 8)
- Logo title / subtitle / footer tagline if needed

---

## Part 3 — File layout reminder

```text
/home/CPANEL_USER/
  proactive-app/                 ← Node application root
    node_modules → symlink       ← MUST be symlink into nodevenv (not a real folder)
    .next/standalone/
      server.js                  ← startup file
      .next/static/              ← copied after every build
      public/                    ← copied after every build
    deploy.sh
    .env                         ← optional; prefer panel env
  nodevenv/proactive-app/20/     ← CloudLinux Node virtualenv
  proactive-uploads/             ← UPLOAD_DIR (persistent)
```

---

## Part 4 — Troubleshooting (battle-tested 2026-09)

| Symptom | Likely cause | Fix |
|---|---|---|
| `npm: command not found` | Virtualenv not activated | `source ~/nodevenv/…/bin/activate` from Node panel |
| `./deploy.sh: Permission denied` | Not executable | `chmod +x deploy.sh` or `bash deploy.sh` |
| `cagefs_enter: Unable to fork` / LVE | Process or PMEM limit | Stop Node app; kill `next-server`; wait; retry; ask host to raise limits |
| `spawn … node EAGAIN` during build | Too many `next-server` / workers | Stop app; `pkill` next-server; `experimental.cpus: 1` + `workerThreads: false` (already in `next.config.js`); low `NODE_OPTIONS` |
| `Cannot find module 'tailwindcss'` | Prod install skipped devDeps | `NODE_ENV=development npm install --include=dev` |
| CloudLinux “store node modules… symlink” | Real `node_modules` folder in app root | `rm -rf node_modules` then symlink to `nodevenv/…/lib/node_modules` |
| `drizzle-kit push` hangs / “atke” | Waiting for interactive confirm | Ctrl+C; use phpMyAdmin SQL or `yes \| npx drizzle-kit push --force` |
| CSS / JS 404 | Forgot standalone static copy | Copy `.next/static` → `.next/standalone/.next/static` |
| Images 404 for `/images/...` | Forgot `public` copy | Copy `public` → `.next/standalone/public` |
| Uploaded images 404 | Wrong `UPLOAD_DIR` | Absolute path outside app wipe |
| Admin login fails / loops | `AUTH_SECRET` typo (`AUTH_SECRE`) or `NEXTAUTH_URL` | Fix panel env names exactly; restart app |
| Blank page / 503 | App stopped or bad startup file | Start app; startup = `.next/standalone/server.js` |
| Forms save but no email | SMTP unset | OK — check Admin inbox |

**Build still fails with EAGAIN after cleanup:** build on a local PC (`npm run build`), upload `.next/standalone/`, plus `.next/static` into `.next/standalone/.next/static`, plus `public` into `.next/standalone/public`, then Start the app.

Logs: cPanel Node app → stdout/stderr / error log.

---

## Part 5 — Security checklist

- [ ] Unique strong `AUTH_SECRET` (never commit; rotate if pasted in chat/SSH history)
- [ ] No `.env` or passwords in git
- [ ] `UPLOAD_DIR` outside deploy wipe paths
- [ ] HTTPS live; rotate any weak/default admin password
- [ ] SMTP password only if mail is required
- [ ] Restrict SSH / cPanel access to operators

App already sends baseline headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).

---

## Part 6 — Backup & rollback

| What | How |
|---|---|
| Code | Previous git commit + rebuild/deploy |
| Content | MySQL dump |
| Media / CVs | Copy of `UPLOAD_DIR` |

The standalone build is disposable. **MySQL + uploads** are the durable state.

---

## Quick reference — safe update (copy/paste)

```bash
# 0) Stop Node app in cPanel first
source ~/nodevenv/proactive-app/20/bin/activate
cd ~/proactive-app
pkill -u $USER -f "next-server" || true

git pull
ls -la node_modules   # must be symlink

export NODE_OPTIONS="--max-old-space-size=1536"
export RAYON_NUM_THREADS=1
export UV_THREADPOOL_SIZE=1

NODE_ENV=development npm install --include=dev --no-audit --no-fund
npm run build

mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static .next/standalone/public
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
mkdir -p tmp && touch tmp/restart.txt
# Start Node app in cPanel
```

Schema: prefer phpMyAdmin `ALTER TABLE` — avoid interactive `db:push` on this host. Never `db:seed` on production.

---

*Aligned with `next.config.js` (`cpus: 1`, `workerThreads: false`), `deploy.sh`, `.env.example`, and `docs/DEPLOYMENT.md`. Updated after 2026-09 production deploy pain points.*
