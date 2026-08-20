# Phase 2 — Dynamic site + admin dashboard: requirements audit & architecture plan

Status: **PLANNING ONLY. Nothing implemented.**
Written: 2026-08-19 · Companion to `CLAUDE.md` (spec) and `TASK_STATE.md` (state)

This document is the result of a full read of the Phase 1 codebase. It inventories
every piece of content on the site, states what the backend must provide, names the
decisions that are still open, and proposes an implementation order.

---

## 0. Executive findings (read these first)

1. **The deploy target contradicts the plan.** The site is live on **Netlify as a
   static export**. `CLAUDE.md` §3 assumed cPanel. A static export cannot run route
   handlers, ISR, Server Actions, sessions or a database. **Every Phase 2 capability
   requires a Node runtime.** This is the single blocking decision (see Q-H1).
2. **The contact and career forms are almost certainly dead in production.**
   `next.config.js` drops `route.node.ts` from the build in static mode, so
   `/api/contact` and `/api/career` do not exist on the Netlify deploy unless
   `NEXT_PUBLIC_CONTACT_ENDPOINT` / `NEXT_PUBLIC_CAREER_ENDPOINT` were pointed at an
   external handler in the Netlify UI. Verify before anything else — a supplier site
   silently dropping enquiries is a live commercial problem, not a Phase 2 item.
3. **`HANDOFF.md` assumes a separate API on another host.** That was the right hedge
   when hosting was unknown. If admin and site live in one Next.js app, the public
   data layer should query the database **directly server-side** and skip the HTTP hop
   entirely. `remote.ts` stays as a fallback, not the primary path.
4. **Nine files import mock content directly**, bypassing `lib/data`. They are the
   real frontend work of Phase 2 (§4.3). The pages that already go through `lib/data`
   need *no* changes at all.
5. **`CLAUDE.md` names Summernote as the editor.** Summernote is jQuery-based, and §1
   of the same document forbids jQuery. Summernote only ever needed to exist in the
   admin bundle, not the public site — but if we are building the admin now, TipTap is
   the better call (see Q-T5).
6. **Roughly 60% of the site's visible copy is hardcoded in JSX or in
   `lib/data/mock/content.ts`,** not behind `lib/data`. The mock files are *not* a
   database schema — several of them flatten things that need to be separate tables
   (gallery albums, product images, spec rows, list orderings).

---

## 1. Content inventory

Legend — **Src** = where content comes from today (`JSX` hardcoded in a component ·
`mock` = `lib/data/mock/content.ts` imported directly · `data` = already behind
`lib/data/index.ts`). **CRUD** = needs create/read/update/delete in admin.
**Img** = image or file upload. **Ord** = user-controlled ordering.
**Pub** = publish/unpublish or draft state. **SEO** = per-record SEO fields.
**Rel** = relationships to other content.

### 1.1 Home — `/`

| # | Section | Src | Becomes DB | CRUD | Img | Ord | Pub | SEO | Rel |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Hero slides (3 images) | JSX `Hero.tsx` | yes | ✔ | ✔ | ✔ | ✔ | – | media |
| 1 | Hero eyebrow / headline / sub / CTA labels+links | JSX | yes | singleton | – | – | – | – | – |
| 1 | Hero stats (100+ / 15+ / 2024) | JSX | yes | ✔ | – | ✔ | – | – | – |
| 2 | About teaser: intro paragraph | `mock.aboutIntro` | yes | singleton | – | – | – | – | – |
| 2 | About teaser: 2nd para, heading, image, "100+" plate | JSX | yes | singleton | ✔ | – | – | – | media |
| 3 | Our Solutions — intro + 8 tiles | `mock.solutions` | yes | ✔ | ✔ | ✔ | ✔ | future | media |
| 4 | Featured categories (4 cards) | **data** | already | ✔ | ✔ | ✔ | ✔ | ✔ | products |
| 4 | Section heading / lede / eyebrow | JSX | yes | singleton | – | – | – | – | – |
| 5 | Why Choose Us (4 items + icon enum) | `mock.whyChooseUs` | yes | ✔ | – | ✔ | – | – | – |
| 6 | Capabilities: title, lede, body | `mock.capabilities` | yes | singleton | – | – | – | – | – |
| 6 | Capabilities: 8 service chips | `mock.capabilities.services` | yes | ✔ | – | ✔ | – | – | – |
| 6 | Capabilities: 4-step approach ladder | `mock.capabilities.approach` | yes | ✔ | – | ✔ | – | – | – |
| 7 | Vision / Mission strip | `mock.vision` / `mock.mission` | yes | singleton | – | – | – | – | – |
| 8 | Core values (5 + icon enum) | `mock.coreValues` | yes | ✔ | – | ✔ | – | – | – |
| 9 | Gallery preview (6) | **data** | already | ✔ | ✔ | ✔ | ✔ | – | album |
| 10 | Partner logos (8) | **data** | already | ✔ | ✔ | ✔ | ✔ | – | media |
| 11 | CTA band (title/lede override + phone/email) | JSX + **data** | yes | singleton | – | – | – | – | settings |

### 1.2 About — `/about`

| Section | Src | Becomes DB | CRUD | Img | Ord | SEO |
|---|---|---|---|---|---|---|
| PageHero eyebrow/title/lede/image | JSX + `mock.aboutIntro` | yes | page singleton | ✔ | – | ✔ |
| Stats plate (2024 / 15+ / 100+ / 4) | JSX | yes | ✔ | – | ✔ | – |
| Company body (rich HTML) | `mock.aboutBody` | yes | singleton | – | – | – |
| Founder aside: portrait, name, blurb, link | JSX | yes | singleton | ✔ | – | – |
| CTA band overrides | JSX | yes | page singleton | – | – | – |

### 1.3 Founder Message — `/about/founder-message`

| Section | Src | Becomes DB | CRUD | Img | SEO |
|---|---|---|---|---|---|
| Portrait + caption (name, role) | JSX | yes | singleton | ✔ | – |
| Pull-quote ("judged on uptime…") | JSX | yes | singleton | – | – |
| Message body (rich HTML) | `mock.founderMessage` | yes | singleton | – | – |
| Signature block (script name, name, role) | JSX | yes | singleton | ✔ opt | – |
| Page SEO / metadata | JSX metadata | yes | page singleton | – | ✔ |

### 1.4 Products — `/products`, `/products/[category]`, `/products/[category]/[product]`

| Section | Src | Becomes DB | CRUD | Img | Ord | Pub | SEO | Rel |
|---|---|---|---|---|---|---|---|---|
| "What We Offer" intro (rich) | `mock.whatWeOfferIntro` | yes | page singleton | – | – | – | – | – |
| PageHero copy (all three levels) | JSX | yes | page singleton | ✔ | – | – | ✔ | – |
| **Categories** | **data** | already | ✔ | ✔ | ✔ | ✔ | ✔ | products |
| Category rich description | **data** | already | ✔ | – | – | – | – | – |
| **Products** | **data** | already | ✔ | ✔ | ✔ | ✔ | ✔ | category |
| Product gallery (`images: string[]`) | **data** | **restructure → own table** | ✔ | ✔ | ✔ | – | – | media |
| Product specs (`{label,value}[]`) | **data** | **restructure → own table** | ✔ | – | ✔ | – | – | – |
| Product rich content | **data** | already | ✔ | – | – | – | – | – |
| Related products row | derived | derived, optionally manual | opt | – | ✔ | – | – | products |
| Product JSON-LD | derived | derived | – | – | – | – | – | – |
| Product counts per category | derived | derived | – | – | – | – | – | – |

### 1.5 Vision & Mission — `/vision-mission`

| Section | Src | Becomes DB | CRUD | Img | Ord |
|---|---|---|---|---|---|
| PageHero + image | JSX | yes | page singleton | ✔ | – |
| Vision statement | `mock.vision` | yes | singleton | – | – |
| Mission statement | `mock.mission` | yes | singleton | – | – |
| Core values (5 — shared with home) | `mock.coreValues` | yes | ✔ | – | ✔ |
| Section heading + lede | JSX | yes | page singleton | – | – |

### 1.6 Global Sourcing — `/global-sourcing`

| Section | Src | Becomes DB | CRUD | Ord |
|---|---|---|---|---|
| PageHero + intro | `mock.globalSourcing.intro` | yes | page singleton | – |
| Narrative body (rich, contains `<h2>`s) | `mock.globalSourcing.body` | yes | singleton | – |
| 4 pillars (title/desc, **icon by array index**) | `mock.globalSourcing.pillars` | yes | ✔ | ✔ |
| CTA overrides | JSX | yes | page singleton | – |

> Pillar icons are chosen by **array position** (`pillarIcons[i]` in the page). In the
> database the icon must become an explicit stored field, or reordering silently
> changes which icon each pillar gets.

### 1.7 Our Story — `/our-story`

| Section | Src | Becomes DB | CRUD | Ord |
|---|---|---|---|---|
| PageHero | JSX | yes | page singleton | – |
| Timeline (5 entries: year / title / description) | `mock.storyTimeline` | yes | ✔ | ✔ |
| Closing statement block | JSX | yes | singleton | – |

### 1.8 Company — `/company`

| Section | Src | Becomes DB | CRUD | Img | Ord |
|---|---|---|---|---|---|
| PageHero + image | JSX + `mock.companyProfile.intro` | yes | page singleton | ✔ | – |
| Profile body (rich) | `mock.companyProfile.body` | yes | singleton | – | – |
| Fact sheet (6 label/value rows) | `mock.companyProfile.facts` | yes | ✔ | – | ✔ |
| Company profile **PDF** (today a mailto placeholder) | none | **new** | singleton | ✔ file | – |
| Parent company block (name/role/desc/url/logo) | `mock.parentCompany` | yes | singleton | ✔ | – |
| CTA overrides | JSX | yes | page singleton | – | – |

### 1.9 Media Centre — `/media`

| Section | Src | Becomes DB |
|---|---|---|
| PageHero | JSX | page singleton |
| 3 hub cards (title/desc/href/image) | JSX array | singleton, or stays fixed in code |
| Counts (news / photos / videos) | derived from data | derived |

### 1.10 News — `/media/news`, `/media/news/[slug]`

| Section | Src | Becomes DB | CRUD | Img | Ord | Pub | SEO |
|---|---|---|---|---|---|---|---|
| Posts (title, slug, cover, excerpt, content, date) | **data** | already | ✔ | ✔ | by date | ✔ **needed** | ✔ |
| "More news" row on detail | derived | derived | – | – | – | – | – |
| PageHero copy | JSX | yes | page singleton | – | – | – | ✔ |
| **Missing:** draft/scheduled state, author, `updatedAt`, tags, pagination | – | **new** | ✔ | – | – | ✔ | – |

### 1.11 Photo Gallery — `/media/photo-gallery`

| Section | Src | Becomes DB | CRUD | Img | Ord | Pub |
|---|---|---|---|---|---|---|
| Images (src / caption / album) | **data** | already | ✔ | ✔ | ✔ **needed** | ✔ |
| **Albums** — a free-text string per image, derived client-side today | **data** | **restructure → own table** | ✔ | – | ✔ | ✔ |
| PageHero copy | JSX | yes | page singleton | – | – | – |

### 1.12 Video Gallery — `/media/video-gallery`

| Section | Src | Becomes DB | CRUD | Ord | Pub |
|---|---|---|---|---|---|
| Videos (title, youtubeId, publishedAt) | **data** | already | ✔ | ✔ **needed** | ✔ |
| **Missing:** description, custom thumbnail, explicit order field | – | new | ✔ | ✔ | – |
| PageHero copy | JSX | yes | page singleton | – | – |

### 1.13 Career — `/career`

| Section | Src | Becomes DB | CRUD | Img | Ord | Pub | Rel |
|---|---|---|---|---|---|---|---|
| Job openings (title/location/type/summary) | **data** | already | ✔ | – | ✔ **needed** | ✔ **needed** | applications |
| **Missing:** slug + detail page, rich description, department, deadline, open/closed | – | new | ✔ | – | – | ✔ | – |
| Application form | client → `/api/career` | **new: persist** | inbox | ✔ CV | – | – | job |
| PageHero + section copy | JSX | yes | page singleton | ✔ | – | – | – |

### 1.14 Contact — `/contact`

| Section | Src | Becomes DB | CRUD |
|---|---|---|---|
| Address / phone / email / map query | **data** (`SiteSettings`) | already | settings |
| Social links | **data** | already, **own table** | ✔ + order |
| **Office hours** (hardcoded, incl. emergency note) | JSX | yes | settings |
| Contact form | client → `/api/contact` | **new: persist** | inbox |
| Map embed | derived from `mapQuery` | already | settings |
| PageHero copy | JSX | yes | page singleton |

### 1.15 Global chrome

| Area | Src | Becomes DB | Notes |
|---|---|---|---|
| Header nav structure | `lib/nav.ts` (code) | decision Q-C10 | categories already injected from `lib/data` |
| Header CTA label / href | JSX | yes | settings |
| Logo | `components/layout/Logo.tsx` | optional | inline SVG today |
| Footer quick links | `lib/nav.ts` `footerLinks` | decision Q-C10 | |
| Footer category column | **data** | already | |
| Footer contact block / socials / map | **data** | already | |
| Copyright line | JSX | yes | settings |
| Theme toggle | client | no | UI only |
| Root metadata (title template, description, keywords, OG image) | JSX `layout.tsx` | yes | global SEO settings |
| Organization JSON-LD | JSX `layout.tsx` | **derive from settings** | today it duplicates address / phone / socials in a second place — a real drift risk |
| `sitemap.ts` | derived from data | derived | must filter unpublished; `lastModified` is currently `new Date()` for every route |
| `robots.ts` | code | code + settings toggle | needs a `noindex` switch for staging |
| 404 page | JSX | no | |

### 1.16 Content that exists nowhere yet (new in Phase 2)

- Contact message records · career application records + stored CVs
- Admin users, sessions, password resets
- Media library (uploads, alt text, dimensions)
- Redirects (slug changes break URLs)
- Audit log
- Company profile PDF
- Optional: product enquiry / quote requests, newsletter signups

---

## 2. Backend requirements

### 2.1 Database

Naming below is logical, not final SQL. All tables get `id`, `created_at`,
`updated_at`; content tables get `status`, and publishable ones `published_at`.

#### A. Catalogue

| Entity | Key fields | Why it exists |
|---|---|---|
| `categories` | slug ᵁ, name, description(html), image_id→media, sort_order, status, seo_title, seo_description, og_image_id | Drives `/products`, category pages, the header dropdown and the footer column. Already the shape the frontend expects. |
| `products` | slug, category_id→categories, name, summary, content(html), sort_order, status, published_at, seo_* | The core catalogue. `(category_id, slug)` unique; a globally unique slug is simpler but forbids the same product name in two lines. |
| `product_images` | product_id, media_id, alt, sort_order | `Product.images` is a `string[]` today. A join table is required for ordering, alt text and reuse of one media record; the frontend still receives a `string[]`. |
| `product_specs` | product_id, label, value, sort_order | Spec rows feed both the spec table and the Product JSON-LD. Ordered rows, not a JSON blob, so admin can drag-reorder. |
| `solutions` | slug ᵁ, title, media_id, sort_order, status, (future: summary, content) | The eight home tiles. `slug` already exists in the mock precisely so these can become routes later. |

#### B. Editorial & media

| Entity | Key fields | Why |
|---|---|---|
| `news_posts` | slug ᵁ, title, cover_media_id, excerpt, content(html), status(draft/scheduled/published), published_at, author_id→users, seo_* | Needs a draft state — today publication is implicit in the array. |
| `news_tags` + `news_post_tags` | name, slug / join table | Only if Q-C7 says yes. |
| `gallery_albums` | slug ᵁ, name, sort_order, status | Album is a free-text string on each image today and the filter chips are derived from it. A table gives stable names, ordering, and rename-without-orphaning. |
| `gallery_images` | album_id (nullable), media_id, caption, sort_order, status | |
| `videos` | title, youtube_id, description, thumbnail_media_id (nullable), published_at, sort_order, status | `youtube_id` must be the bare ID; accept a URL in admin and extract on save. |
| `partners` | name, logo_media_id, website_url, sort_order, status | Marquee order is a visual decision. |

#### C. Page / section content (the part that does not exist today)

| Entity | Key fields | Why |
|---|---|---|
| `pages` | key ᵁ (`home`, `about`, `founder-message`, `products`, `vision-mission`, `global-sourcing`, `our-story`, `company`, `media`, `news`, `photo-gallery`, `video-gallery`, `career`, `contact`), hero_eyebrow, hero_title, hero_lede, hero_media_id, cta_title, cta_lede, seo_title, seo_description, og_media_id, noindex | One row per **fixed** route. Every `PageHero`, every page `metadata` export and every `CTABand` override becomes editable without inventing a page builder. Routes stay in code; only their copy is data. |
| `content_blocks` | key ᵁ (`about.body`, `founder.message`, `vision.statement`, `mission.statement`, `company.profile_body`, `sourcing.body`, `products.intro`, `home.about_teaser`, `capabilities.body`, …), group, label, type(text/html/json), value | The singleton prose fields. A key/value store keeps the schema from growing a column per paragraph; the admin renders one form per `group`. |
| `list_items` | list_key, title, subtitle, body, icon, media_id, value, meta(json), sort_order, status | The repeatable list sections: `core_values`, `why_choose_us`, `capability_services`, `capability_steps`, `sourcing_pillars`, `timeline`, `company_facts`, `stats.home_hero`, `stats.about`, `hero_slides`. **Trade-off:** one generic table plus a per-`list_key` field schema declared in code (zod) gives one admin screen and one migration, at the cost of database-level type safety. The alternative — nine near-identical tables — is more rigorous and much more code. Recommended: the generic table, with the field registry checked into `lib/admin/lists.ts`. |
| icons | *(not a table)* | Icons must be a **stored string validated against a code allowlist** (the existing `lucide-react` map). Never an array index — `globalSourcing.pillars` currently picks icons by position, which breaks on reorder. |

#### D. Settings & structure

| Entity | Key fields | Why |
|---|---|---|
| `site_settings` | single row: company_name, phone, email, address, map_query, office_hours, emergency_note, copyright, cta_label, default_og_media_id, company_profile_media_id, analytics_id?, maintenance_mode? | Already exists as `SiteSettings`; extend with the fields currently hardcoded. **The Organization JSON-LD in `layout.tsx` must be generated from this row**, not from a second hardcoded copy. |
| `social_links` | label, href, icon, sort_order, status | Ordered, and the footer maps `label → icon`; store the icon key explicitly. |
| `parent_company` | name, role, description, url, logo_media_id, visible | Its own row (or a settings group) — client-review content that may be removed entirely. |
| `nav_items` | location(header/footer), parent_id, label, href, type(internal/external/`dynamic:categories`), sort_order, visible, open_in_new | Only if Q-C10 says the menu must be editable. Otherwise keep `lib/nav.ts`. Dynamic category injection must remain a `type`, never four hand-typed links. |
| `redirects` | from_path ᵁ, to_path, status_code(301/302), created_at | **Required.** Slugs become editable; an edited product slug otherwise 404s every inbound link. Auto-create a row whenever a published record's slug changes. |

#### E. Media

| Entity | Key fields | Why |
|---|---|---|
| `media` | filename, storage_key, url, mime, size, width, height, alt, title, folder, checksum, blur_data_url, uploaded_by, created_at | One library, so an image swap propagates everywhere. `width`/`height` are mandatory — `next/image` needs them to hold CLS near zero (CLAUDE.md §5.8). `checksum` de-dupes re-uploads. |
| `media_usages` (optional) | media_id, entity, entity_id | Lets admin warn before deleting an in-use image instead of leaving broken images on the site. |

#### F. Forms & inbox

| Entity | Key fields | Why |
|---|---|---|
| `contact_messages` | name, email, phone, subject, message, ip, user_agent, referer, status(new/read/replied/archived/spam), admin_notes, created_at | Enquiries are the site's commercial output. Email alone loses them. |
| `career_applications` | job_opening_id (nullable), position (text snapshot), full_name, email, phone, cover_letter, resume_media_id, ip, user_agent, status(new/reviewing/shortlisted/rejected/archived), admin_notes, created_at | `position` is free text today; keep the snapshot **and** the FK, so deleting an opening does not orphan the application. |
| `job_openings` | slug, title, department, location, type, summary, description(html), status(draft/open/closed), sort_order, posted_at, closes_at | Extends the existing `JobOpening`. |

#### G. Auth & operations

| Entity | Key fields | Why |
|---|---|---|
| `users` | email ᵁ, password_hash, name, role(admin/editor/viewer), is_active, last_login_at, must_change_password | No public signup; seeded or invited only. |
| `sessions` | user_id, token_hash ᵁ, expires_at, ip, user_agent | Database sessions allow instant revoke ("log out everywhere"); JWT-only cannot. |
| `password_reset_tokens` | user_id, token_hash, expires_at, used_at | |
| `login_attempts` (or a rate-limit store) | identifier, ip, attempted_at, ok | Lockout and throttling for a public-facing admin login. |
| `audit_log` | user_id, action, entity, entity_id, diff(json), ip, created_at | Multi-editor content: cheap insurance, and the only way to answer "who deleted that". |

#### Cross-cutting database rules

- **Slugs** — generated from the name, editable, unique per scope; immutable by default in the UI with an explicit "change slug" affordance that writes a `redirects` row.
- **Ordering** — integer `sort_order`, gapped by 10 on insert; drag-reorder writes a batch update.
- **Status** — `draft | published | archived` on everything public. Public queries filter `status='published' AND (published_at IS NULL OR published_at <= now())`.
- **Soft delete** — `deleted_at` on catalogue and editorial tables. Hard-delete media only after a usage check.
- **Timestamps** — everywhere; `updated_at` also feeds `sitemap.ts` `lastModified`, which currently reports "now" for every route.
- **SEO** — `seo_title`, `seo_description`, `og_media_id` on categories, products, news, job openings and `pages`; fall back to name/summary when null (the existing `stripHtml()` helper already does this).

### 2.2 Admin dashboard scope

**Not a page builder.** CLAUDE.md §11 exists because Elementor's freedom is what
ruined the old site. The design system (CMYK identity, section rhythm, band/paper
alternation) *is* the product. Admin gets **structured forms over a fixed layout**.

| Module | Capability |
|---|---|
| Dashboard home | Counts, recent enquiries and applications, recently edited, unpublished drafts |
| Categories | CRUD, reorder, image, rich description, SEO, publish |
| Products | CRUD, reorder within category, move category, multi-image gallery with reorder, spec rows with reorder, rich content, SEO, publish, duplicate |
| Solutions | CRUD, reorder, image, publish |
| News | CRUD, rich editor, cover image, excerpt, publish/schedule/draft, preview, SEO |
| Photo gallery | Album CRUD + reorder; bulk upload, drag-reorder, caption/alt, move between albums |
| Videos | CRUD, paste YouTube URL → ID extracted, reorder, publish |
| Partners | CRUD, logo upload, reorder |
| Job openings | CRUD, open/close, reorder |
| Pages | One form per fixed route: hero copy, hero image, CTA overrides, SEO, noindex |
| Section content | Grouped forms over `content_blocks` (About body, Founder message, Vision, Mission, Sourcing narrative, Company profile, Capabilities copy, What-We-Offer intro) |
| Lists | Generic ordered-list editor over `list_items`, driven by the per-list field registry (core values, why-choose-us, timeline, facts, pillars, stats, hero slides, capability services and steps) |
| Media library | Grid, upload, replace-in-place, alt/title editing, folders, usage view, delete with usage guard |
| Enquiries | Contact inbox: list, status filter, search, detail, mark read/replied/spam, notes, CSV export |
| Applications | Career inbox: same, plus authenticated CV download and filter by opening |
| Settings | Company details, office hours, socials, parent company, company profile PDF, global SEO defaults, copyright |
| Navigation | Header/footer menu editor — only if Q-C10 = yes |
| Redirects | List / add / remove; auto-created rows visible |
| Users | Invite, role, deactivate, force password reset (admin role only) |
| Audit log | Read-only, filterable |

**Admin UX conventions to hold:** every list screen has search, status filter and
pagination; every form has an explicit Save with a dirty-state warning; every
publishable record separates Save-draft from Publish; the slug field shows the
resulting URL; image fields state the required dimensions from the placeholder
manifest in `scripts/generate-placeholders.mjs`.

### 2.3 API

Two surfaces. **They are not the same thing and should not be built the same way.**

**Public reads — no HTTP API.** If site and admin are one Next app, `lib/data` should
call the database directly in Server Components (`lib/data/db.ts`). It is faster (no
serialization hop), simpler (no auth or CORS surface), and keeps `revalidate`
semantics intact. `remote.ts` stays for the split-host scenario only.

**Public writes (already exist — shapes frozen by `lib/validation.ts`):**

| Method | Path | Auth | Responsibility |
|---|---|---|---|
| POST | `/api/contact` | public | zod validate → honeypot silent-200 → rate limit → insert `contact_messages` → notify. 200/422/400 per HANDOFF.md §3 |
| POST | `/api/career` | public | multipart; validate fields + CV (PDF/DOC ≤ 5 MB, magic-byte sniff) → store privately → insert `career_applications` → notify |

**Admin mutations — Server Actions** for forms (no hand-written fetch layer, works
with the existing react-hook-form + zod pairing), plus Route Handlers where a real
HTTP endpoint is needed:

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/admin/media` | admin/editor | multipart upload, sharp probe, returns the `media` record |
| DELETE | `/api/admin/media/:id` | admin | usage-guarded |
| GET | `/api/admin/applications/:id/resume` | admin/editor | streams the private CV; never a public URL |
| GET | `/api/admin/export/{contact,career}.csv` | admin | |
| POST | `/api/auth/*` | public | login / logout / reset (framework-provided) |
| POST | `/api/revalidate` | internal token | on-demand ISR invalidation if publishing from outside the app |

**Optional public REST v1** (`/api/v1/...`, read-only, matching HANDOFF.md's table)
only if a second consumer appears — mobile app, static-export mode, a separate
dashboard host. Build it when there is a consumer, not before.

**Cross-cutting:** every input parsed with zod at the boundary; list endpoints take
`page`, `perPage` (max 100), `q`, `status`, `sort`; one error envelope
(`{ ok:false, message, errors? }`); rate limits on every public POST; no stack traces
in responses.

### 2.4 Authentication

- **Who:** internal staff only. No public registration, no customer accounts (unless Q-C1 changes that).
- **Roles:** ship three and enforce from day one even with a single user —
  `admin` (everything, including users, settings and redirects), `editor` (content and
  inboxes, no users or settings), `viewer` (read-only, for client stakeholders).
- **Credentials:** email + password. Argon2id (or bcrypt cost ≥ 12). Minimum 12
  characters. Force a change on first login.
- **Sessions:** database-backed session, opaque token in an httpOnly, Secure,
  SameSite=Lax cookie. 8h idle timeout, 7-day absolute, rolling renewal. Database
  sessions over pure JWT because deactivating a user must take effect immediately.
- **Protection:** middleware guards `/admin/*` and `/api/admin/*`; **every Server
  Action re-checks session and role server-side** — middleware alone is not authorization.
- **Hardening:** login rate limit and lockout, generic failure message, CSRF on all
  state-changing forms (Server Actions carry this), `noindex` on admin routes,
  security headers (CSP, HSTS, X-Frame-Options), optional TOTP 2FA for `admin`.
- **Library:** Auth.js v5 credentials provider with a database session adapter.
  Trade-off: heavier than a hand-rolled cookie session and its credentials flow is
  deliberately minimal — but it gets CSRF, cookie flags and callbacks right, which is
  exactly where hand-rolled auth fails.

### 2.5 Media

- **Storage abstraction first** (`lib/storage/` with `put` / `get` / `delete` / `url`),
  two drivers: `local` (cPanel or VPS persistent disk) and `s3` (any S3-compatible
  bucket), selected by env var. This is what stops the hosting decision (Q-H1) from
  being irreversible.
- **Recommended default:** S3-compatible object storage (Cloudflare R2 — no egress
  fees, cheap, reachable from any host). Public bucket for site imagery; **a separate
  private bucket or prefix for CVs**, served only through the authenticated admin route.
- **Upload pipeline:** magic-byte MIME sniff (never trust `Content-Type`) → size cap
  (images 8 MB, PDFs 10 MB, CVs 5 MB) → extension allowlist → strip EXIF → re-encode
  with `sharp` → probe width/height → generate a small blurDataURL → write the `media`
  row. Reject SVG uploads outright, or sanitize them (SVG is an XSS vector).
- **Delivery:** keep `next/image` (Mode A optimizer). Add the bucket host to
  `images.remotePatterns`. Never bypass `next/image` for content imagery — CLAUDE.md §11.
- **Replace-in-place:** replacing a file keeps the record id so every reference updates
  at once; version the storage key to bust caches.
- **Deletion:** usage-guarded; soft delete then a sweep job.
- **Alt text is a required field on upload** — the site's accessibility floor depends on it.

### 2.6 Forms

| Concern | Contact | Career |
|---|---|---|
| Validation | `contactSchema`, unchanged, shared client + server | `careerSchema` + `resumeFileSchema` |
| Storage | `contact_messages` | `career_applications` + private CV in storage |
| Spam | honeypot (already built) + IP rate limit + submission-time floor + optional Turnstile | same |
| Notification | email to the sales inbox, reply-to = sender | email to the HR inbox |
| Admin | inbox, statuses, notes, search, CSV export | same, plus CV download and filter by opening |
| Privacy | retention policy (Q-C12) | CV downloads should be audit-logged |

Keep the request and response shapes in HANDOFF.md §3 exactly — the client components
depend on them, and the honeypot's silent-200 is deliberate (`TASK_STATE.md` decision #2).

A likely additional form: **per-product enquiry / "request a quote"** (Q-C5) — the
obvious conversion path a B2B catalogue of this kind currently lacks.

---

## 3. Recommended architecture

| Layer | Recommendation | Why / trade-off |
|---|---|---|
| App shape | **One Next.js app**: public site + `/admin` route group + API | Shared types, shared zod schemas, direct DB reads (no HTTP hop), one deploy. Trade-off: admin code ships from the same origin — mitigate with a separate route group, `noindex`, and a CI check that no public route imports admin code. |
| Runtime | **Node (Mode A) only. Retire static export (Mode B).** | Mode B cannot do auth, uploads, ISR or POST. Keeping it alive doubles every decision. Retiring it also lets `route.node.ts` go back to `route.ts`. |
| Database | **PostgreSQL** (Neon / Supabase / managed) if cloud-hosted; **MySQL / MariaDB** if cPanel | Postgres for JSON, partial indexes and full-text search. If the client's cPanel is the host, MySQL is free and already there — with an ORM this is a config change, not a rewrite. |
| ORM | **Prisma** | Type-safe client from one schema, first-class migrations, works on both engines, team-standard for Next.js. Trade-off: heavier cold start and a larger binary than Drizzle — irrelevant on a persistent Node server, relevant on serverless. Pick Drizzle if the host is serverless with cold-start sensitivity. |
| Public data access | `lib/data/index.ts` → `lib/data/db.ts` (Prisma, server-only) | Preserves the existing contract exactly. |
| Caching | `unstable_cache` with per-entity tags + `revalidateTag` on publish; keep `revalidate = 60` as the floor | A publish appears immediately instead of up to 60s later. |
| Admin mutations | **Server Actions** + zod, with Route Handlers for upload / download / export | Least code, no duplicated fetch layer, CSRF handled. |
| Auth | **Auth.js v5**, credentials + DB sessions, argon2id | §2.4 |
| Rich text | **TipTap** (headless, React, no jQuery), sanitize on write, plus the existing DOMPurify sanitize on render | CLAUDE.md §1 forbids jQuery; Summernote is jQuery. TipTap emits clean HTML that the existing `RichText` / `.prose` path renders unchanged. **Needs sign-off — it contradicts the Summernote note in CLAUDE.md §8.** |
| Admin UI | Tailwind on the existing tokens; headless primitives (Radix) only where needed; TanStack Table if list screens get heavy | Do not add a UI kit to the public bundle. |
| Media | Storage abstraction; R2/S3 default, local driver for cPanel; sharp pipeline | §2.5 |
| Email | Resend (or SMTP via nodemailer against the company mailbox) | Deliverability from a shared cPanel IP is usually poor; a transactional provider with SPF/DKIM on the domain is the safer default. |
| Deployment | Follows Q-H1. Ranked: **Vercel** (best Next.js fit, ISR and Server Actions native) > **Netlify with the Next runtime** (least disruption from today) > **cPanel Node app** (matches CLAUDE.md, keeps everything on the client's existing hosting) > VPS | |
| Observability | Structured logs, Sentry or equivalent, DB + media backups with a **tested** restore | A CMS without a tested restore is a liability. |

### Architecture shapes rejected, and why

- **Headless CMS (Strapi / Payload / Sanity / Directus).** Would deliver the dashboard
  far faster and is a legitimate option worth naming to the client (Q-T1b). Rejected as
  the default because it adds a second runtime and bill to host, and this content model
  is small, fixed and unusually design-coupled. **Payload 3** — which runs inside the
  same Next app on Postgres — is the one genuinely worth evaluating before committing
  to a hand-built admin; the trade is weeks of CRUD work against a large dependency
  with its own upgrade path.
- **Separate PHP/Laravel API on cPanel + static frontend.** Matches HANDOFF.md's
  original hedge and the old stack's hosting. Rejected: two languages, two deploys,
  duplicated validation, and the frontend loses ISR.
- **Generic page-builder / block editor.** Explicitly against CLAUDE.md §11 and the
  reason this rebuild exists.
- **Keeping static export with client-side fetching.** Kills SEO on catalogue pages and
  the LCP discipline Phase 1 was built around.

---

## 4. Frontend integration strategy

**Design and markup do not change.** The work is source-swapping, plus turning three
synchronous components async.

### 4.1 The data layer gains a third source

```
lib/data/index.ts        // unchanged public API — the only module UI imports
  ├── mock/*             // kept, for local dev and tests without a database
  ├── db.ts        NEW   // Prisma queries, server-only, maps rows → lib/types.ts
  └── remote.ts          // retained for a split-host deployment
```

`const SOURCE = process.env.DATA_SOURCE ?? 'mock'` → `'mock' | 'db' | 'remote'`.
Keeping `mock` alive means the frontend still builds and renders with no database,
which is worth the small branch cost.

### 4.2 Mapping is `db.ts`'s job, not the components'

The database stores `image_id`; the frontend keeps receiving `image: string`.
`product_images` rows collapse back into `images: string[]`. `product_specs` rows
become `specs: {label,value}[]`. This is what lets `lib/types.ts` stay byte-identical
and every already-integrated page stay untouched.

**New getters `lib/data/index.ts` must gain:**
`getSolutions()` · `getHeroSlides()` · `getPage(key)` · `getContentBlock(key)` ·
`getContentBlocks(group)` · `getList(listKey)` · `getStats(group)` · `getSocials()` ·
`getParentCompany()` · `getNav()` (if DB-driven) · `getJobOpening(slug)` ·
`getNews({page, perPage})` · `getGalleryAlbums()` · `getRedirect(path)`

### 4.3 Files that must change — the complete list

Direct mock imports to re-point at `lib/data` — **11 files**:

| File | Currently imports | Becomes |
|---|---|---|
| `app/page.tsx` | `aboutIntro, coreValues, mission, vision, whyChooseUs` | `getPage('home')`, `getContentBlocks('home')`, `getList('core_values')`, `getList('why_choose_us')` |
| `app/about/page.tsx` | `aboutBody, aboutIntro` | `getPage('about')`, `getContentBlocks('about')`, `getList('stats.about')` |
| `app/about/founder-message/page.tsx` | `founderMessage` | `getPage(...)`, `getContentBlocks('founder')` |
| `app/vision-mission/page.tsx` | `coreValues, mission, vision` | `getContentBlocks('vision')`, `getList('core_values')` |
| `app/global-sourcing/page.tsx` | `globalSourcing` | `getContentBlocks('sourcing')`, `getList('sourcing_pillars')` |
| `app/our-story/page.tsx` | `storyTimeline` | `getList('timeline')` |
| `app/company/page.tsx` | `companyProfile, parentCompany` | `getContentBlocks('company')`, `getList('company_facts')`, `getParentCompany()` |
| `app/products/page.tsx` | `whatWeOfferIntro` | `getContentBlocks('products')` |
| `components/home/Solutions.tsx` | `solutions, solutionsIntro` | `getSolutions()` — **becomes async** |
| `components/home/Capabilities.tsx` | `capabilities` | `getContentBlocks('capabilities')` + two lists — **becomes async** |
| `components/home/Hero.tsx` | hardcoded slides + stats | `getHeroSlides()`, `getStats('home_hero')` — **becomes async** |

Also touched:

- `app/layout.tsx` — root metadata and Organization JSON-LD derived from settings.
- Every page's `export const metadata` → `generateMetadata()` reading `pages`.
- `app/sitemap.ts` — filter unpublished; use real `updated_at`.
- `app/robots.ts` — honour a `noindex` setting for staging.
- `lib/nav.ts` — only if the menu becomes DB-driven.
- `next.config.js` — drop the static branch; add bucket `remotePatterns`.
- `app/api/*/route.node.ts` → `route.ts` once Mode B is retired.
- `middleware.ts` — **new**: admin guard + redirect lookup.

### 4.4 What to protect while integrating

- The hero headline stays server-rendered and CSS-only (LCP element — `TASK_STATE.md` decision #4).
- Only `RichText` uses `dangerouslySetInnerHTML`; sanitize on write **and** on render.
- Framer Motion stays lightbox-only; GSAP stays lazy. Admin must not pull either into the public shared bundle.
- Shared first-load JS is **87.3 kB** today — treat any regression as a bug.
- Async components must not serialize the render: keep the `Promise.all` fan-out that `app/page.tsx` already uses.

---

## 5. QUESTIONS I MUST ANSWER BEFORE IMPLEMENTATION

### 5.1 Client / business decisions

- **Q-C1 — Who edits, and do they need roles?** One owner, or sales / HR / marketing with different access? Decides whether RBAC ships in 2B or is deferred.
- **Q-C2 — Draft + preview + scheduled publishing, or publish-immediately?** Draft state and preview routes are a meaningful chunk of 2C and 2D.
- **Q-C3 — Bangla (or any second language), now or ever?** Retrofitting i18n means a translation table on every content entity and a locale segment in every route. Cheap now, expensive later.
- **Q-C4 — Do the 8 Solutions need their own pages** (`/solutions/[slug]`) with content, or stay presentational tiles? The `slug` field already anticipates this.
- **Q-C5 — Per-product "Request a quote" enquiry?** Adds a form, a table and an inbox — and is the obvious conversion path this catalogue currently lacks.
- **Q-C6 — Should career applications attach to a specific opening** (an Apply button per job), or stay a single free-text `position` field?
- **Q-C7 — Does News need categories/tags, author bylines, and pagination?** Pagination is needed regardless once posts exceed roughly 12.
- **Q-C8 — Is the parent-company (Zexora) block confirmed?** Still flagged FOR CLIENT REVIEW: legal entity name, nature of the relationship, real logo.
- **Q-C9 — Will the company profile PDF exist?** If yes it needs a file field and a public download; if no, the mailto placeholder stays.
- **Q-C10 — Must the navigation menu be admin-editable,** or does it stay in `lib/nav.ts`? Editable menus are the classic route to broken links; recommend the current approach — fixed structure with dynamic categories.
- **Q-C11 — Where do form notifications go** (sales inbox, HR inbox), and is there an SMTP account for `info@proactive.com.bd`, or do we use a transactional provider?
- **Q-C12 — CV and enquiry retention.** How long are applications and CVs kept, and who may download them? Drives retention jobs and audit logging.
- **Q-C13 — Content migration.** Does anything need importing from the old WordPress site (news archive, product catalogue, images), or does the Phase 1 seed content become the starting database?

### 5.2 Technical decisions

- **Q-T1 — Single Next.js app (site + `/admin`), or a separate dashboard application?** Recommend single.
- **Q-T1b — Evaluate Payload 3 (or another headless CMS) before hand-building the admin?** Weeks of CRUD work versus a large dependency. Decide once, now.
- **Q-T2 — PostgreSQL or MySQL?** Largely dictated by Q-H1 and Q-H2.
- **Q-T3 — Prisma or Drizzle?** Prisma unless the host is serverless with cold-start sensitivity.
- **Q-T4 — Server Actions or a REST admin API?** Recommend Server Actions; REST only if a second consumer is planned.
- **Q-T5 — Rich text editor: TipTap instead of Summernote?** CLAUDE.md §8 says Summernote; §1 forbids jQuery. This contradiction needs an explicit resolution — it changes the sanitize allowlist and the stored HTML shape.
- **Q-T6 — Media storage: object storage or local disk?** Local disk is only viable on a host with a persistent filesystem (cPanel / VPS); it silently loses files on Vercel or Netlify.
- **Q-T7 — Is static export (Mode B) formally retired?** If it must survive, the admin has to be a separate app with an external API, and the whole architecture changes.
- **Q-T8 — Do we need soft deletes, an audit log and content versioning,** or is "restore from backup" acceptable? Per-record revision history is a genuine cost.
- **Q-T9 — Search:** does `/products` need search and filtering (flagged in `TASK_STATE.md` as the highest-value optional addition)? Postgres full-text vs. simple `ILIKE` vs. none.
- **Q-T10 — Testing bar for Phase 2.** There are no tests today. Minimum viable: zod schema tests, data-layer mapping tests, auth guard tests, upload validation tests. Confirm scope.

### 5.3 Hosting / deployment decisions

- **Q-H1 — Where does Phase 2 run?** *(the blocking question)* Netlify with the Next runtime · Vercel · cPanel Node app · VPS. The current Netlify **static** deploy cannot host any of Phase 2.
- **Q-H2 — Where does the database live, and is it reachable from the app host?** cPanel MySQL is typically bound to localhost, so a cloud-hosted app cannot reach it — this pairing constraint decides Q-T2.
- **Q-H3 — Admin at `/admin` on the main domain, or `admin.proactive.com.bd`?** Affects cookie domain, CSP and deployment topology.
- **Q-H4 — Backups:** who runs database and media backups, how often, and has a restore been tested?
- **Q-H5 — Environments:** is there a staging environment, or do we deploy straight to production? A CMS with no staging makes schema migrations risky.
- **Q-H6 — CI/CD:** Git-push auto-deploy, and who holds the environment secrets?
- **Q-H7 — Budget for managed services** (database, object storage, transactional email, error tracking) — roughly $0–25/month, but it must be someone's line item.
- **Q-H8 — Does the live Netlify site's contact/career form currently work?** If not, that is a production bug to fix now, independently of Phase 2.

---

## 6. Implementation roadmap

Each phase states its exit criteria. **Do not start a phase until the previous one's
exit criteria are met** — that is what prevents a half-migrated content layer.

### Phase 2A — Foundation & database
**Depends on:** Q-H1, Q-H2, Q-T2, Q-T3, Q-T7 answered.
**Tasks:** confirm hosting; provision the database; add ORM and migration tooling;
write the full schema (§2.1); seed from `lib/data/mock/*` verbatim so parity is
checkable; write `lib/data/db.ts` mapping rows → `lib/types.ts`; add `DATA_SOURCE=db`;
retire Mode B in `next.config.js` and rename `route.node.ts` → `route.ts`.
**Files:** `prisma/`, `lib/data/db.ts`, `lib/data/index.ts`, `next.config.js`, `.env.example`, `README.md`.
**Risks:** schema churn later is expensive — settle Q-C3 (i18n) and Q-C4/Q-C6
(relationships) *before* migrating. Retiring Mode B is one-way.
**Exit:** `DATA_SOURCE=db` renders every existing page identically to `mock`, verified page by page.

### Phase 2B — Authentication
**Depends on:** 2A; Q-C1, Q-T1, Q-H3.
**Tasks:** users and sessions tables; Auth.js credentials + argon2id; login / logout /
reset; middleware guard on `/admin/*`; a role-check helper used by every action; rate
limiting and lockout; security headers; a seed script for the first admin.
**Files:** `middleware.ts`, `lib/auth/*`, `app/(admin)/login/`, `app/api/auth/*`.
**Risks:** middleware is not authorization — every mutation must re-check. Cookie flags
and CSRF are where hand-rolled auth fails.
**Exit:** unauthenticated `/admin/*` redirects; roles enforced at the action level; lockout demonstrated.

### Phase 2C — Admin foundation
**Depends on:** 2B.
**Tasks:** `/admin` layout, navigation and dashboard home; shared form primitives (text,
rich text, image picker, slug field, ordered repeater, status toggle); shared list
primitives (table, search, filter, pagination, bulk actions); toast and error handling;
audit-log writer; **one vertical slice end to end (Partners — simplest CRUD plus an
image)** to prove the whole stack before scaling out.
**Files:** `app/(admin)/**`, `components/admin/**`, `lib/admin/**`.
**Risks:** admin code leaking into the public bundle — add a bundle check to CI.
Building nine screens before the first one is proven.
**Exit:** Partners fully manageable (create / edit / reorder / delete / publish), audit-logged, reflected on the public site.

### Phase 2D — Media library
**Depends on:** 2C; Q-T6, Q-H1.
**Tasks:** storage abstraction plus both drivers; upload route with sniffing, limits and
the sharp pipeline; `media` table; library UI (grid, upload, alt/title, replace, delete
with usage guard); an image picker used by every content form; `remotePatterns` in
`next.config.js`.
**Files:** `lib/storage/**`, `app/api/admin/media/**`, `components/admin/MediaPicker.tsx`, `next.config.js`.
**Risks:** unrestricted upload is the biggest new attack surface (SVG XSS, MIME
spoofing, decompression bombs). Missing width/height reintroduces CLS.
**Exit:** an image uploaded in admin renders through `next/image` on the public site with correct dimensions and alt text.

### Phase 2E — Catalogue (categories, products, solutions)
**Depends on:** 2D — products need the gallery picker.
**Tasks:** category CRUD, reorder and SEO; product CRUD with gallery reorder, spec-row
repeater, category move and duplicate; solutions CRUD; slug change → redirect row;
redirect lookup in `middleware.ts`; on-demand revalidation on publish.
**Files:** `app/(admin)/products/**`, `lib/data/db.ts`, `middleware.ts`.
**Risks:** URL breakage on slug edits; `generateStaticParams` must not prerender drafts; N+1 queries on category pages.
**Exit:** a product created in admin appears at its URL, in its category, in the nav dropdown, in the sitemap and in related-product rows.

### Phase 2F — Editorial (news, gallery, videos, jobs)
**Depends on:** 2D.
**Tasks:** news CRUD with rich editor, draft/schedule and preview; gallery albums, bulk
upload and drag-reorder; videos with URL→ID extraction; job openings CRUD with
open/closed; news pagination on `/media/news`.
**Files:** `app/(admin)/news/**`, `app/(admin)/gallery/**`, `app/media/**`.
**Risks:** the album restructure changes a shape the public gallery already consumes;
scheduled publishing needs either a cron or a publish-on-read check.
**Exit:** publishing a post makes it live within the revalidation window; drafts are invisible to logged-out visitors and to the sitemap.

### Phase 2G — Page content, lists and settings
**Depends on:** 2C.
**Tasks:** `pages` table plus a form per route; grouped `content_blocks` editor;
generic `list_items` editor plus the per-list field registry; settings (company, hours,
socials, parent company, profile PDF, global SEO); derive Organization JSON-LD and root
metadata from settings; convert the 11 files in §4.3.
**Files:** the nine mock-importing pages, `components/home/*`, `app/layout.tsx`, `lib/nav.ts`.
**Risks:** the largest surface-area change to existing pages — do it page by page with
a visual diff against the current production render. Three components become async.
**Exit:** no file outside `lib/data/` imports from `lib/data/mock/`.

### Phase 2H — Forms & inboxes
**Depends on:** 2B (inbox auth) and 2D (CV storage).
**Tasks:** persist contact and career submissions; private CV storage plus authenticated
download; notification email; rate limiting and optional Turnstile; both inbox UIs with
status, notes, search and CSV export; retention per Q-C12.
**Files:** `app/api/contact/route.ts`, `app/api/career/route.ts`, `app/(admin)/enquiries/**`, `lib/mail/**`.
**Risks:** **do not change the request/response shapes** — the client components and the
honeypot's silent-200 depend on them. CVs must never get a public URL.
**Exit:** a live submission appears in the inbox, emails the right mailbox, and the CV downloads only for an authenticated user.

### Phase 2I — Hardening, performance & testing
**Depends on:** 2E–2H.
**Tasks:** re-verify the §5 budgets (shared JS ≤ 87.3 kB on public routes, LCP < 2.0s,
CLS < 0.05, Perf ≥ 90) — **including the Lighthouse run still outstanding from Phase 1**;
query and index review; caching and revalidation tags; security pass (headers, CSP, rate
limits, upload validation, authorization on every action); accessibility pass on admin;
tests per Q-T10; backups plus a **tested restore**; error tracking.
**Risks:** admin bundle bleed and unindexed queries are the two likely regressions.
**Exit:** budgets met with real content, restore rehearsed, security checklist signed off.

### Phase 2J — Deployment & handover
**Depends on:** 2I.
**Tasks:** provision production per Q-H1; migrations and seed; DNS and SSL; environment
secrets; a staging→production promotion path; replace the 69 placeholder images with
real assets; client walkthrough plus a written admin guide; rewrite `HANDOFF.md` to
describe the delivered system.
**Risks:** the cutover from the Netlify static deploy needs a rollback plan — the old
build must stay reachable until the new one is verified.
**Exit:** live on the new host, client trained, backups running, rollback documented.

### Sequencing note
2A → 2B → 2C are strictly serial. From 2D onward, **2E, 2F and 2G can run in parallel**
if more than one person is working. 2H can start as soon as 2B and 2D have landed.

---

## 7. Assumptions this plan makes

Stated explicitly so they can be corrected rather than discovered:

1. Phase 2 runs on a Node runtime; static export is retired.
2. Site and admin are one Next.js application on one domain.
3. Content is English-only for now (Q-C3 could invalidate this).
4. There are no customer-facing accounts — admin users only.
5. E-commerce is out of scope: no pricing, cart or checkout.
6. The Phase 1 seed content becomes the initial database contents (Q-C13).
7. `lib/types.ts` field names stay frozen; DB→frontend mapping absorbs the differences.
8. The existing design, markup and motion are final, and are not to be changed for backend convenience.
