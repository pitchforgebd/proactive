# Backend handoff — Phase 2

The frontend is finished and already calls a fixed set of data functions. The
dashboard/API work is to make those same functions return real data. **No UI
component changes are required.**

---

## 1. The switch

`lib/data/index.ts` is the only content API the UI imports. Every function checks
one flag:

```ts
const USE_REMOTE = process.env.NEXT_PUBLIC_DATA_SOURCE === 'remote';
```

To go live on the backend:

```bash
NEXT_PUBLIC_DATA_SOURCE=remote
NEXT_PUBLIC_API_BASE_URL=https://dashboard.proactive.com.bd/api
```

That is the whole swap. `lib/data/remote.ts` already implements every function
against the endpoint list below; if the endpoints match, nothing in that file
needs editing either.

---

## 2. Endpoints to implement

All responses are JSON. Types are in `lib/types.ts` — match them exactly,
including field names.

| Method | Path | Returns |
|---|---|---|
| GET | `/categories` | `Category[]` |
| GET | `/categories/:slug` | `Category` (404 if absent) |
| GET | `/products` | `Product[]` |
| GET | `/products?category=:slug` | `Product[]` filtered by category |
| GET | `/products/:category/:product` | `Product` (404 if absent) |
| GET | `/news` | `NewsPost[]`, newest first |
| GET | `/news/:slug` | `NewsPost` (404 if absent) |
| GET | `/gallery` | `GalleryImage[]` |
| GET | `/videos` | `Video[]` |
| GET | `/partners` | `Partner[]` |
| GET | `/settings` | `SiteSettings` |
| GET | `/jobs` | `JobOpening[]` |

Notes the frontend depends on:

- **`order`** on `Category` and `Product` drives display order — the frontend
  sorts ascending by it.
- **`publishedAt`** on `NewsPost` is an ISO date string (`2026-06-18`).
- **Rich HTML fields** (`Category.description`, `Product.content`,
  `NewsPost.content`) are rendered through `<RichText />`, which sanitizes with
  DOMPurify. Summernote output is fine. `<script>`, `<style>`, `<iframe>`,
  inline `style` and event handlers are stripped — do not rely on them.
- **`Video.youtubeId`** is the bare ID (`aqz-KE-bpKQ`), not a full URL. If the
  dashboard stores full URLs, extract the ID server-side.
- **Image fields** are paths or absolute URLs. If they become absolute URLs on a
  different host, add that host to `images.remotePatterns` in `next.config.js`.
- **404 means "no such record"**, not an error — `remote.ts` converts it to
  `null` so the page can call `notFound()`.

---

## 3. Form intake endpoints

The frontend already posts to these. Shapes are enforced by `lib/validation.ts`
on both sides.

### `POST /api/contact` — JSON

```json
{ "name": "", "email": "", "phone": "", "subject": "", "message": "", "website": "" }
```

- `website` is a **honeypot**. If it is non-empty, the submission is a bot —
  answer `200 {"ok":true}` and discard it silently.
- Persist as `ContactMessage`, notify the sales inbox.

### `POST /api/career` — multipart/form-data

Fields: `fullName`, `email`, `phone`, `position`, `coverLetter`, `website`
(honeypot), plus a `resume` file part.

- Resume: PDF or Word, **max 5 MB**. Validate again server-side.
- Store the file, then persist a `CareerApplication` with the resulting
  `resumeUrl`.

### Responses both endpoints must return

| Situation | Status | Body |
|---|---|---|
| Success | `200` | `{"ok":true}` |
| Validation failure | `422` | `{"ok":false,"message":"...","errors":{...}}` |
| Malformed request | `400` | `{"ok":false,"message":"..."}` |

The current handlers live in `app/api/contact/route.node.ts` and
`app/api/career/route.node.ts`. They already validate and reject correctly;
each has a clearly marked block to replace with the database write:

```
// --- PHASE 2: persist + notify ---
```

---

## 4. Dashboard scope

CRUD for:

- **Categories** — name, slug, rich description (Summernote), image, order, SEO
- **Products** — name, slug, category, multiple images, summary, rich content,
  spec rows (label/value pairs), order, SEO
- **News** — title, slug, cover image, excerpt, rich content, publish date, SEO
- **Gallery images** — image, caption, album
- **Videos** — title, YouTube ID or URL, publish date
- **Partners** — name, logo
- **Job openings** — title, location, type, summary

Inboxes:

- **Career applications** — with resume file download
- **Contact messages**

Global settings:

- Company name, phone, email, address, map query string, social links
  (this is the `SiteSettings` object; it feeds the header, footer and contact
  page directly)

---

## 5. Rendering / caching contract

Dynamic pages use ISR at 60 seconds:

```ts
export const revalidate = 60;
```

`remote.ts` passes the same `next: { revalidate: 60 }` to every fetch. A publish
in the dashboard therefore appears on the site within a minute — **in Mode A
(Node hosting) only**. Under Mode B (static export) content changes need a
rebuild. See `README.md`.

`generateStaticParams` pre-renders every category, product and news slug at
build time; anything added afterwards is served on demand and then cached.

---

## 6. What must not change

- Function names and signatures in `lib/data/index.ts`
- Field names in `lib/types.ts`
- The form request/response shapes in §3

Everything else — storage, framework, hosting of the dashboard — is the backend
team's call.
