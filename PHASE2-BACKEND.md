# PHASE2-BACKEND.md — Proactive Trade International — Backend, Dashboard & Fully Dynamic Pages

> Companion to `CLAUDE.md` (Phase 1 frontend, already built). Read that first.
> This file specs the **backend + admin dashboard**, wires the frontend's
> `lib/data` layer to a real database, and makes **every page and every section
> editable from the dashboard** — while keeping each section's design coded and
> fast (a *structured section-based CMS*, NOT a drag-and-drop page builder).
>
> **Deployment is locked: Mode A — Next.js Node.js standalone on cPanel
> (Node 18+, terminal available) + MySQL + on-demand ISR.**

---

## 0. Scope

Turn the mock-driven frontend into a live, fully editable site:
- **Fully dynamic pages & sections** — every page is an ordered list of sections;
  every section's content (headings, text, images, lists, rich HTML, CTAs) is
  edited from the dashboard. Section *design* stays in code.
- Admin **dashboard** (CRUD) for Pages/Sections, Categories, Products, News,
  Gallery, Videos.
- **Inbox** for Career applications (with resume files) and Contact messages.
- **Global settings** (contact info, socials, map embed).
- Wire `lib/data` from `mock` → `remote` (DB) by changing **one file**.
- **On-demand ISR**: publishing in the dashboard refreshes public pages in seconds,
  no full rebuild.

Everything lives in the **same Next.js app** — no separate backend service.

---

## 1. Stack additions (on top of Phase 1)

| Concern | Choice | Why |
|---|---|---|
| Database | **MySQL** (cPanel-native) | Free with the plan, reliable, terminal migrations |
| DB access | **Drizzle ORM** + `mysql2` | Pure TS, no native binary (unlike Prisma) → cPanel-safe & light |
| Migrations | **drizzle-kit** | Run from terminal |
| Auth (admin) | **Auth.js (NextAuth)** credentials + `bcrypt` | Simple single/few-admin login |
| Rich text (admin) | **Summernote** in dashboard → HTML | Client asked for summernote; frontend already renders sanitized HTML |
| HTML sanitize | `isomorphic-dompurify` (on save + on render) | Defense in depth |
| Field validation | **zod** (shared with Phase 1 + section schemas) | One schema source |
| File uploads | Local **persistent uploads dir** + a file-serving route | No external storage needed on cPanel |
| Email (optional) | `nodemailer` via cPanel SMTP (`info@proactive.com.bd`) | Notify on career/contact submissions |

> **Do NOT use Prisma** unless the host proves the query-engine binary works —
> Drizzle avoids that whole class of shared-hosting failure.

---

## 2. Architecture

```
Public pages (Server Components)
        │  read directly
        ▼
   lib/data/index.ts  ──►  lib/data/remote.ts  ──►  Drizzle  ──►  MySQL
        ▲                        (was: mock/)
        │  Phase 1 imported mock; Phase 2 swaps this import only

Each dynamic page:  getPage(slug) ──► ordered, visible sections ──► <SectionRenderer/>
        section.type ──► coded React component (design fixed)
        section.data ──► editable content (dynamic)

Admin dashboard (/admin/*)  ──►  Server Actions / Route Handlers  ──►  Drizzle
        │  after a successful write:
        └──►  revalidatePath()  ──►  public ISR pages refresh

Public forms (/career, /contact)  ──►  /api/career, /api/contact  ──►  Drizzle (+ email)
```

Key points:
- **Reads happen in Server Components via `lib/data` calling Drizzle directly** —
  no internal HTTP hop, fastest path.
- **Writes** go through Server Actions or Route Handlers (dashboard + public forms).
- **On-demand revalidation** is what makes Mode A worth it: no rebuild on publish.

---

## 3. The one-file swap (mock → remote)

Phase 1 built `lib/data/index.ts` to re-export from `mock/`. Phase 2:

```ts
// lib/data/index.ts  (Phase 2)
export * from './remote';   // was: export * from './mock';
```

`lib/data/remote.ts` must implement the **exact same signatures** the frontend
already calls, PLUS the page/section readers:

```ts
// pages & sections (new)
getPage(slug: string): Promise<{ page: Page; sections: SectionRow[] } | null>
getAllPageSlugs(): Promise<string[]>

// collections (as before)
getCategories(): Promise<Category[]>
getCategoryBySlug(slug: string): Promise<Category | null>
getProductsByCategory(slug: string): Promise<Product[]>
getProductBySlug(cat: string, prod: string): Promise<Product | null>
getAllProducts(): Promise<Product[]>
getNews(): Promise<NewsPost[]>
getNewsBySlug(slug: string): Promise<NewsPost | null>
getGallery(): Promise<GalleryImage[]>
getVideos(): Promise<Video[]>
getSettings(): Promise<Settings>
```

`getPage` returns the page with its sections already **ordered** and filtered to
**visible** for the public site (the dashboard reads all, including hidden).
Because the types already exist, this is a mechanical Drizzle-row → type mapping.
**Frontend components stay untouched** except the prop-driven refactor in §6.

---

## 4. Database connection (cPanel-safe)

Shared MySQL has a low `max_user_connections`. Use a **small pooled singleton**:

```ts
// lib/db.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const globalForDb = globalThis as unknown as { pool?: mysql.Pool };

const pool =
  globalForDb.pool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,          // keep small on shared hosting
    waitForConnections: true,
  });
if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

export const db = drizzle(pool, { schema, mode: 'default' });
```

Keep `connectionLimit` low (≤5). Reuse the singleton so dev hot-reload doesn't
exhaust connections.

---

## 5. Schema (`lib/schema.ts`, Drizzle / MySQL)

### 5.1 Pages & sections (the dynamic-page engine)

```ts
import { mysqlTable, varchar, int, text, longtext, timestamp, json, boolean } from 'drizzle-orm/mysql-core';

export const pages = mysqlTable('pages', {
  slug: varchar('slug', { length: 160 }).primaryKey(),   // 'home','about','vision-mission'…
  title: varchar('title', { length: 250 }).notNull(),
  seoTitle: varchar('seo_title', { length: 200 }),
  seoDescription: varchar('seo_description', { length: 320 }),
  ogImage: varchar('og_image', { length: 500 }),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const sections = mysqlTable('sections', {
  id: varchar('id', { length: 36 }).primaryKey(),
  pageSlug: varchar('page_slug', { length: 160 }).notNull(),  // FK -> pages.slug
  type: varchar('type', { length: 60 }).notNull(),            // must exist in the registry
  order: int('order').notNull().default(0),
  visible: boolean('visible').notNull().default(true),
  data: json('data').notNull(),                               // fields for this section type
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
```
Index `sections.pageSlug`.

### 5.2 Collections

```ts
export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  description: longtext('description'),        // rich HTML
  image: varchar('image', { length: 500 }),
  order: int('order').default(0),
  seoTitle: varchar('seo_title', { length: 200 }),
  seoDescription: varchar('seo_description', { length: 320 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = mysqlTable('products', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 160 }).notNull(),
  categorySlug: varchar('category_slug', { length: 160 }).notNull(),
  name: varchar('name', { length: 250 }).notNull(),
  images: json('images'),                      // string[]
  summary: text('summary'),
  content: longtext('content'),                // rich HTML (Summernote)
  specs: json('specs'),                        // {label,value}[]
  order: int('order').default(0),
  seoTitle: varchar('seo_title', { length: 200 }),
  seoDescription: varchar('seo_description', { length: 320 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const news = mysqlTable('news', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  title: varchar('title', { length: 300 }).notNull(),
  coverImage: varchar('cover_image', { length: 500 }),
  excerpt: text('excerpt'),
  content: longtext('content'),                // rich HTML
  publishedAt: timestamp('published_at').defaultNow(),
});

export const galleryImages = mysqlTable('gallery_images', {
  id: varchar('id', { length: 36 }).primaryKey(),
  src: varchar('src', { length: 500 }).notNull(),
  caption: varchar('caption', { length: 300 }),
  album: varchar('album', { length: 160 }),
  order: int('order').default(0),
});

export const videos = mysqlTable('videos', {
  id: varchar('id', { length: 36 }).primaryKey(),
  title: varchar('title', { length: 300 }).notNull(),
  youtubeId: varchar('youtube_id', { length: 40 }).notNull(),
  publishedAt: timestamp('published_at').defaultNow(),
});

export const careerApplications = mysqlTable('career_applications', {
  id: varchar('id', { length: 36 }).primaryKey(),
  fullName: varchar('full_name', { length: 200 }).notNull(),
  email: varchar('email', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 40 }),
  position: varchar('position', { length: 200 }),
  coverLetter: text('cover_letter'),
  resumeUrl: varchar('resume_url', { length: 500 }),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const contactMessages = mysqlTable('contact_messages', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 40 }),
  subject: varchar('subject', { length: 250 }),
  message: text('message').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const settings = mysqlTable('settings', {
  id: int('id').primaryKey().default(1),       // single row
  phone: varchar('phone', { length: 40 }),
  email: varchar('email', { length: 200 }),
  address: varchar('address', { length: 400 }),
  mapEmbed: text('map_embed'),
  facebook: varchar('facebook', { length: 300 }),
  linkedin: varchar('linkedin', { length: 300 }),
  instagram: varchar('instagram', { length: 300 }),
  youtube: varchar('youtube', { length: 300 }),
});

export const adminUsers = mysqlTable('admin_users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 200 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 160 }),
});
```
Add index on `products.categorySlug` and unique on `(products.categorySlug, products.slug)`.

---

## 6. Fully dynamic pages & sections (section-based CMS)

### 6.1 The model in one line
A page = an ordered list of **sections**. Each section has a **type** (coded
component + fixed design) and a **data** blob (editable content). Dashboard edits
the data, reorders/toggles sections; frontend renders each section with its
component. **Design in code; content in the database.**

### 6.2 Why this, not a page builder
- ✅ Every heading, paragraph, image, list, CTA, stat is editable → "sob dynamic".
- ✅ Admin can reorder, hide/show, and add instances of allowed section types.
- ✅ Design stays hand-coded → fast, no builder runtime, no DOM bloat, no CLS.
- ❌ Admin cannot author arbitrary layout/CSS/HTML structure (that is exactly what
  caused the old Elementor site's problems). New *section types* are added by a
  developer in code, not in the UI. This is the guardrail.

### 6.3 Section-type registry (the coded catalog)
One registry is the contract shared by frontend rendering, the dashboard editor,
and validation. Each entry: a label, the React component, a **zod field schema**,
and default data.

```ts
// lib/sections/registry.ts
import { z } from 'zod';
import Hero from '@/components/sections/Hero';
import RichTextSection from '@/components/sections/RichTextSection';
import ImageText from '@/components/sections/ImageText';
import ValueGrid from '@/components/sections/ValueGrid';
import VisionMission from '@/components/sections/VisionMission';
import Stats from '@/components/sections/Stats';
import Timeline from '@/components/sections/Timeline';
import FeaturedCategories from '@/components/sections/FeaturedCategories';
import GalleryPreview from '@/components/sections/GalleryPreview';
import Partners from '@/components/sections/Partners';
import CTA from '@/components/sections/CTA';

export const sectionRegistry = {
  hero: {
    label: 'Hero / Slider',
    component: Hero,
    schema: z.object({
      slides: z.array(z.object({
        image: z.string(), headline: z.string(), subtext: z.string().optional(),
        ctaText: z.string().optional(), ctaHref: z.string().optional(),
      })).min(1),
    }),
  },
  richText: {
    label: 'Rich Text Block', component: RichTextSection,
    schema: z.object({ title: z.string().optional(), html: z.string() }),
  },
  imageText: {
    label: 'Image + Text', component: ImageText,
    schema: z.object({
      image: z.string(), side: z.enum(['left','right']).default('left'),
      heading: z.string(), html: z.string(),
      ctaText: z.string().optional(), ctaHref: z.string().optional(),
    }),
  },
  valueGrid: {
    label: 'Value / Feature Grid', component: ValueGrid,
    schema: z.object({
      title: z.string().optional(),
      items: z.array(z.object({ icon: z.string().optional(), title: z.string(), text: z.string().optional() })),
    }),
  },
  visionMission: {
    label: 'Vision & Mission', component: VisionMission,
    schema: z.object({
      visionTitle: z.string(), visionText: z.string(),
      missionTitle: z.string(), missionText: z.string(), image: z.string().optional(),
    }),
  },
  stats: {
    label: 'Stats Band', component: Stats,
    schema: z.object({ items: z.array(z.object({ value: z.string(), label: z.string() })) }),
  },
  timeline: {
    label: 'Timeline / Journey', component: Timeline,
    schema: z.object({
      title: z.string().optional(),
      milestones: z.array(z.object({ year: z.string(), title: z.string(), text: z.string().optional() })),
    }),
  },
  featuredCategories: {
    label: 'Featured Product Categories', component: FeaturedCategories,
    schema: z.object({ title: z.string().optional(), limit: z.number().default(4) }),
  },
  galleryPreview: {
    label: 'Gallery Preview', component: GalleryPreview,
    schema: z.object({ title: z.string().optional(), limit: z.number().default(8) }),
  },
  partners: {
    label: 'Partner Logos', component: Partners,
    schema: z.object({ title: z.string().optional(), logos: z.array(z.string()) }),
  },
  cta: {
    label: 'Call To Action Band', component: CTA,
    schema: z.object({ heading: z.string(), text: z.string().optional(), buttonText: z.string(), buttonHref: z.string() }),
  },
} as const;

export type SectionType = keyof typeof sectionRegistry;
```
Add new section types here only (developer action).

### 6.4 Frontend rendering
Every dynamic page becomes the same tiny shell.

```tsx
// components/sections/SectionRenderer.tsx
import { sectionRegistry } from '@/lib/sections/registry';

export function SectionRenderer({ sections }: { sections: SectionRow[] }) {
  return (
    <>
      {sections
        .filter(s => s.visible)
        .sort((a, b) => a.order - b.order)
        .map(s => {
          const entry = sectionRegistry[s.type as keyof typeof sectionRegistry];
          if (!entry) return null;                 // unknown type → skip safely
          const parsed = entry.schema.safeParse(s.data);
          if (!parsed.success) return null;        // bad data → skip, don't crash
          const Cmp = entry.component as any;
          return <Cmp key={s.id} {...parsed.data} />;
        })}
    </>
  );
}
```

```tsx
// e.g. app/about/page.tsx  (keep explicit route files per page for clean SEO)
export const revalidate = 60;
export async function generateMetadata() { /* from page.seoTitle / seoDescription */ }

export default async function Page() {
  const res = await getPage('about');
  if (!res) notFound();
  return <SectionRenderer sections={res.sections} />;
}
```

**Refactor note:** the Phase 1 section components currently hardcode their content.
Make each one **prop-driven** (accept the fields from its schema) so the same
component renders from `data`. Content moves out of the component and into the DB.
This is the only change to existing frontend components.

### 6.5 Pages to seed
`home, about, founder-message, vision-mission, global-sourcing, our-story,
company, media, career, contact`. Product/category/news **detail** routes stay
collection-driven (already specced); their pages may still carry section-based
intro/CTA blocks if useful.

---

## 7. Admin dashboard

Routes (same app, protected):

```
/admin/login
/admin                      dashboard home (counts, recent submissions)

/admin/pages                list all pages (slug, title, section count, last edited)
/admin/pages/[slug]         SECTION EDITOR for that page
/admin/pages/[slug]/seo     edit page title/description/OG

/admin/categories           list · /new · /[id]/edit
/admin/products             list (filter by category) · /new · /[id]/edit
/admin/news                 list · /new · /[id]/edit
/admin/gallery              upload + manage
/admin/videos               add YouTube link + manage
/admin/career               applications inbox (view, download resume, mark read)
/admin/contact              messages inbox (view, mark read)
/admin/settings             contact info, socials, map
```

**Section editor (`/admin/pages/[slug]`):**
- Shows the page's sections as an ordered list (type label, visible toggle, edit,
  delete, drag-to-reorder → writes `order`).
- **Add section** → pick from the registry's allowed types → insert with default data.
- **Edit section** → a form auto-generated from that type's zod schema:
  string → text input; `html`/long fields → **Summernote**; `image` → the uploader
  (§8); arrays → repeatable field groups (add/remove rows); enum → select;
  number → number input; boolean → toggle.
- On save: validate against the schema, **sanitize HTML fields server-side**,
  persist `data`, then **revalidate** the page's public path (§9).

General dashboard rules:
- Protect all `/admin/*` (except `/admin/login`) with **middleware** checking the
  Auth.js session; redirect unauthenticated → `/admin/login`.
- Dashboard UI: reuse Phase 1 design tokens but keep it **utilitarian** — tables,
  forms, clear empty/error states. Not the marketing look, and NO drag-drop canvas.
- Summernote on all rich fields; sanitize HTML before storing.
- Slug auto-generate from name (editable), enforce uniqueness.

Auth: Auth.js Credentials provider, look up `adminUsers`, `bcrypt.compare`, JWT
session in an httpOnly cookie. Seed one admin via terminal (`npm run create-admin`).

---

## 8. File uploads (cPanel-safe & deploy-safe)

**Critical:** with `output: 'standalone'`, the `public/` folder is replaced on every
deploy. **Never write uploads into `public/`** — they'd be wiped.

Pattern:
1. Store uploads in a **persistent directory outside the build**, e.g.
   `~/proactive-app/uploads/` (a sibling that `deploy.sh` never touches).
2. Save files with a safe unique name; store the **relative path** in the DB.
3. Serve them via a route handler:
   `app/api/files/[...path]/route.ts` — streams from the uploads dir, sets
   content-type. DB stores e.g. `"/api/files/resumes/abc123.pdf"`.
4. Validate on upload: allowed types (images: jpg/png/webp; resume: pdf/doc/docx),
   max size (images ≤5MB, resume ≤10MB), reject everything else.

`deploy.sh` must **exclude** the uploads dir from any clean/rebuild step.

---

## 9. On-demand revalidation (the Mode A payoff)

After any successful create/update/delete/reorder, revalidate the affected public
paths so ISR pages refresh in seconds.

```ts
import { revalidatePath } from 'next/cache';

// page/section edits — map slug -> route:
const pagePathMap: Record<string,string> = {
  home: '/', about: '/about', 'founder-message': '/about/founder-message',
  'vision-mission': '/vision-mission', 'global-sourcing': '/global-sourcing',
  'our-story': '/our-story', company: '/company', products: '/products',
  media: '/media', career: '/career', contact: '/contact',
};
revalidatePath(pagePathMap[pageSlug]);

// product edits:
revalidatePath('/products');
revalidatePath(`/products/${categorySlug}`);
revalidatePath(`/products/${categorySlug}/${productSlug}`);

// news edits:
revalidatePath('/media/news');
revalidatePath(`/media/news/${slug}`);
```

Public dynamic pages keep `export const revalidate = 60` as a fallback.

---

## 10. Public forms → DB

- `/career` → `POST /api/career`: zod-validate, handle resume upload (§8), insert
  into `career_applications`, optional email notify. Clear success/error states.
- `/contact` → `POST /api/contact`: zod-validate, insert into `contact_messages`,
  optional email notify. Clear success/error states.
- **Honeypot + basic rate-limit** on both endpoints to stop spam.

---

## 11. Environment variables

`.env` (never commit; also set in cPanel Node app panel):

```
DB_HOST=localhost
DB_USER=cpaneluser_proactive
DB_PASSWORD=********
DB_NAME=cpaneluser_proactive
AUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://proactive.com.bd
UPLOAD_DIR=/home/cpaneluser/proactive-app/uploads
# optional email
SMTP_HOST=mail.proactive.com.bd
SMTP_PORT=465
SMTP_USER=info@proactive.com.bd
SMTP_PASS=********
```

---

## 12. cPanel deploy (Mode A, with terminal)

1. **DB:** cPanel → MySQL Databases → create DB + user, grant all. Note creds.
2. **Node app:** cPanel → Setup Node.js App → Node 20 LTS, app root `proactive-app`,
   startup file = standalone `server.js`. Copy its activation command.
3. **Env vars:** add all of §11 in the Node app panel (or `.env`).
4. **Build & migrate** (terminal):
   ```bash
   cd ~/proactive-app
   npm ci
   npm run db:push          # drizzle-kit push  → creates tables
   npm run db:seed          # seed pages+sections+collections, create admin
   npm run build
   cp -r .next/static .next/standalone/.next/static
   cp -r public .next/standalone/public
   touch tmp/restart.txt
   ```
5. Point the domain to the Node app; verify `/` and `/admin/login`.

`server.js` respects `process.env.PORT` (Passenger assigns it) — don't hardcode a port.

**`deploy.sh`** (repeatable, uploads-safe):
```bash
#!/bin/bash
set -e
git pull
npm ci
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
# NOTE: never touch ./uploads here
touch tmp/restart.txt
echo "Deployed ✅"
```
Schema changes: `npm run db:generate && npm run db:migrate` from terminal.

---

## 13. Build order (Phase 2)

1. Add MySQL DB + creds; add `lib/db.ts`, `lib/schema.ts` with ALL tables incl.
   `pages` + `sections`; run `db:push`.
2. Build `lib/sections/registry.ts`; refactor every Phase 1 section component to be
   **prop-driven** (content via props, nothing hardcoded).
3. Add `getPage` / `getAllPageSlugs` + all collection readers to `lib/data/remote.ts`;
   flip `index.ts` to remote.
4. Build `SectionRenderer`; convert each page route to `getPage()` + `SectionRenderer`
   (keep explicit route files for SEO/metadata).
5. Seed script: pages+sections reproducing Phase 1 layout with real content
   (CLAUDE.md §9), plus collections, plus one bcrypt admin. Verify site looks unchanged.
6. Auth.js login + `/admin` middleware protection.
7. Dashboard: `/admin/pages` list + section editor (schema-driven forms, Summernote,
   uploader, reorder, visible toggle, add/delete).
8. Dashboard collections CRUD: Categories → Products → News → Gallery → Videos.
   Career + Contact inboxes; wire public form endpoints to DB. Settings page drives
   header/footer contact/socials/map.
9. On-demand revalidation on every write (§9).
10. Security pass (§14), then deploy per §12.

---

## 14. Security & guardrails checklist

- ✅ Design lives in code; only content is data. No admin-authored layout/CSS/HTML structure.
- ✅ All `/admin/*` behind auth middleware; passwords bcrypt-hashed.
- ✅ Sanitize all rich HTML server-side before storing AND on render.
- ✅ Validate every input and every section `data` against its zod schema; skip
  invalid sections instead of crashing the page.
- ✅ Unknown/removed section types render as nothing, never an error.
- ✅ File uploads: type + size whitelist; store outside `public`; unique names.
- ✅ Never expose DB creds / `AUTH_SECRET` to the client; server-only modules.
- ✅ Honeypot + basic rate-limit on public forms.
- ✅ Parameterized queries only (Drizzle) — no string-built SQL.
- ✅ `.env` git-ignored; secrets also set in the cPanel panel.
- ✅ Keep MySQL pool small and reuse a singleton (low max_user_connections).
