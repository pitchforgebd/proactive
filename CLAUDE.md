# CLAUDE.md — Proactive Trade International — Website Rebuild

> This file is the single source of truth for building the frontend of the new
> Proactive Trade International website. Read it fully before writing any code.
> Build the **frontend first** (backend-agnostic). The backend dashboard comes
> in a later phase; nothing here should hard-couple components to a specific
> backend.

---

## 0. Mission

Rebuild `https://proactive.com.bd/` from scratch as a **fast, modern, futuristic**
website for a **printing & packaging machinery + consumables supplier** in
Bangladesh. The current site is WordPress + Elementor and is being replaced
because of the problems that page-builder stack causes (see §11). The new build
must be **fast-loading, fast-routing, easy to edit, and cPanel-deployable.**

**Non-negotiable qualities:** speed, clean routing, maintainability,
printing-industry visual identity, mobile-first responsiveness.

---

## 1. Tech Stack (fixed)

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js 14+ (App Router, React Server Components)** | Fast routing, prefetching, ISR, SEO |
| Language | **TypeScript** | Safety, self-documenting data models |
| Styling | **Tailwind CSS** + CSS variables for design tokens | Small CSS, no page-builder bloat |
| Animation | **Framer Motion** (`motion`) + CSS; optional **Lenis** for smooth scroll | Printing-themed motion, GPU-friendly |
| Icons | **lucide-react** | Lightweight |
| Rich text render | sanitized HTML renderer (`isomorphic-dompurify` or `rehype-sanitize`) | Dashboard uses Summernote → outputs HTML |
| Forms | **react-hook-form** + **zod** | Career + Contact validation |
| Fonts | **next/font** (self-hosted) | Zero layout shift, no external blocking |
| Images | **next/image** (AVIF/WebP) | Core to fast loading |

Do **not** add: jQuery, Bootstrap, any page builder, heavy UI kits, or a CSS-in-JS
runtime. Keep the client bundle lean.

---

## 2. Architecture: backend-agnostic data layer (critical)

All content (categories, products, news, gallery, videos) is dynamic and will
later come from a dashboard + database. **Do not fetch inside components.** Route
every data read through a single data-access layer so the backend can be swapped
without touching UI:

```
lib/
  data/
    index.ts        // public API: getCategories(), getProductsByCategory(slug), etc.
    mock/           // Phase 1: JSON/TS fixtures (real seeded content, see §9)
    remote.ts       // Phase 2: swap-in for Next API routes OR external PHP/REST API
  types.ts          // shared TypeScript models (§8)
```

Components import only from `lib/data`. Phase 1 returns mock data; Phase 2 changes
one file. This is what lets us build the whole frontend now and wire the backend later.

**Rendering strategy per page type:**
- Static/marketing pages (Home, About, Vision, etc.) → static.
- Dynamic content pages (products, categories, news) → **ISR** (`export const revalidate = 60`) if hosting on Node, or generated at build time if static-export.
- Career/Contact forms → client components posting to an API endpoint (Phase 2).

---

## 3. Hosting reality — cPanel (read before deploy)

Two supported deploy modes. Pick based on the cPanel plan:

**Mode A — Node.js app (preferred).** If cPanel has "Setup Node.js App"
(CloudLinux/Passenger, Node 18+):
- Build with `output: 'standalone'`.
- Run the Next.js server via the Node app manager; point the domain to it.
- Enables SSR + **ISR** → live dashboard content without full rebuilds.

**Mode B — Static export (fallback).** If Node.js is unavailable:
- `next.config.js` → `output: 'export'`, `images: { unoptimized: true }`.
- `next build` produces `/out`; upload to `public_html`.
- Dynamic content requires either a rebuild-on-publish step or client-side
  fetch from a separate API (e.g. a small PHP/MySQL API on the same cPanel).

**Action item for the human:** confirm Node.js support in cPanel. Default the
build to Mode A; keep Mode B possible by never using server-only APIs that
static export can't handle without a fallback.

Keep `next.config.js` clean and commented so switching modes is a small diff.

---

## 4. Site map & routes (App Router)

Menu labels on the left, routes on the right. "What We Offer" is the Products system.

```
Home                          /
About Us                      /about
  └ Message from Founder&CEO  /about/founder-message
What We Offer (= Products)    /products                     (category grid)
  └ <Category>                /products/[category]          (products in category)
     └ <Product>              /products/[category]/[product] (product detail)
Vision & Mission              /vision-mission
Global Sourcing               /global-sourcing
Our Story                     /our-story
Company                       /company
Media Centre                  /media                        (hub landing)
  ├ News                      /media/news  ·  /media/news/[slug]
  ├ Photo Gallery             /media/photo-gallery
  └ Video Gallery             /media/video-gallery          (YouTube links/embeds)
Career                        /career                       (application form)
Contact                       /contact
```

Navbar dropdowns: **About** (About Us, Founder Message), **What We Offer**
(the categories, dynamically listed), **Media Centre** (News, Photo Gallery,
Video Gallery). Keep a persistent **"Get in Touch"** CTA button in the header.

> Note: on the current live site the "Company" menu points to an external domain
> (zexora.com.bd). Treat `/company` as a normal internal page here; confirm intended
> content with the client. Do not hardcode an external redirect.

---

## 5. Performance requirements (the whole point)

Hard targets (measure with Lighthouse, mobile):
- **LCP < 2.0s**, **CLS < 0.05**, **INP/TBT** low, Lighthouse Perf **≥ 90**.

Rules the build must follow:
1. **Server Components by default.** Mark `"use client"` only where interactivity
   truly needs it (nav toggle, carousels, forms, motion wrappers).
2. **`next/image` everywhere**, with correct `sizes`, `priority` only on the hero
   image, lazy for the rest. Never ship raw `<img>` for content images.
3. **`next/font`** self-hosted, `display: 'swap'`, subset. No `<link>` to Google Fonts.
4. **Instant routing:** use `<Link>` (auto-prefetch on viewport). Keep route
   segments light so prefetch is cheap. Page transitions must feel instant
   (< ~300ms); do not block navigation on animation.
5. **Code-split heavy stuff:** `dynamic(() => import(...), { ssr: false })` for
   carousels, video embeds, map, and any Framer Motion-heavy section. Gate motion
   behind viewport (`whileInView`) so off-screen work doesn't run.
6. **YouTube videos:** never embed the raw iframe on load — use a lightweight
   facade (thumbnail + play button) that swaps to the iframe on click.
7. **Google Map:** lazy-load on interaction/scroll, not on first paint.
8. **No layout shift:** reserve dimensions for all media; skeletons for async lists.
9. **`prefers-reduced-motion`** respected globally — all animations degrade to
   opacity-only or none.
10. Keep first-load JS small; audit the bundle. No unused libs.

---

## 6. Design direction — "CMYK Precision"

This must **not** look like a generic template or the default AI aesthetic
(cream + serif + terracotta). Anchor the identity in the printing world's own
materials: **CMYK color separation, registration/crop marks, halftone dots,
offset press, paper stock.** Modern, futuristic, technical, trustworthy — this is
a B2B industrial supplier, not a lifestyle brand.

### Design tokens

Color (CSS variables in `globals.css`):
```
--ink:        #0E1116;   /* rich near-black "key" — primary text/bg dark */
--ink-2:      #171B21;   /* elevated dark surface */
--paper:      #F4F6F8;   /* cool paper-stock white — light surface */
--paper-2:    #FFFFFF;
--graphite:   #3A4048;   /* muted UI text / borders */
--cyan:       #00AEEF;   /* process cyan  — accent 1 (signature) */
--magenta:    #EC008C;   /* process magenta — accent 2 (signature) */
--yellow:     #FFD400;   /* process yellow — sparing highlight only */
--line:       rgba(255,255,255,.08); /* hairline on dark */
```
Use cyan + magenta as the signature duo (registration/CMYK). Yellow is a rare
highlight, never a background. Keep 90% of surfaces ink or paper; spend color
deliberately.

Type (self-hosted via next/font):
- **Display:** `Archivo` (or `Space Grotesk`) — industrial grotesk, tight,
  confident. Use expanded/heavy weights for headings.
- **Body:** `Inter` — neutral, legible at all sizes.
- **Mono / technical:** `JetBrains Mono` or `IBM Plex Mono` — for product codes,
  spec labels, eyebrows, registration coordinates. The mono captions are part of
  the identity (they read like press/press-sheet annotations).

Set a real type scale (e.g. 12/14/16/20/28/40/56/72) with intentional tracking on
display sizes. Do **not** use a serif display face — that's the tell we're avoiding.

### Signature element (the one thing the site is remembered by)

**CMYK registration snap.** On hero load, the headline / logo mark renders as four
slightly offset CMYK channels that converge into perfect register (like a press
coming into alignment). Frame major sections with faint **crop marks** at the
corners and a subtle **halftone dot** field in the background of dark sections.
This is the boldness — keep everything else quiet and disciplined.

### Motion (printing-themed, restrained, reduced-motion aware)

- Hero: the CMYK registration snap (once, ~600ms, then still).
- Scroll reveals: "ink spread" / halftone dissolve — subtle, `whileInView`, once.
- Hover on cards/CTAs: tiny registration crosshair or halftone shimmer.
- Route transitions: fast print-sweep wipe, < 300ms, never blocks nav.
- Section dividers can animate a thin roller/registration line.
Keep it orchestrated in a few key places, not scattered everywhere — over-animation
reads as AI-generated and hurts performance.

### Quality floor
Responsive to mobile, visible keyboard focus rings, accessible color contrast on
paper and ink, semantic HTML, alt text on all images.

---

## 7. Page-by-page content spec

### Home `/`
Sections in order:
1. **Hero** — full-width slider/statement with the CMYK registration signature.
   Headline: "One-Stop Printing & Packaging Solutions." Sub: trusted supplier in
   Bangladesh, 100+ companies served. Primary CTA "Explore Products" → `/products`,
   secondary "Get in Touch" → `/contact`. (Slider images exist on the current site.)
2. **About teaser** — short intro + "View More" → `/about`.
3. **Featured products / categories** — cards for the 4 categories with image +
   name, "View More" → `/products`.
4. **Why Choose Us** — 3–4 value props (trust, world-class manufacturers,
   technical support, partnerships).
5. **Vision & Mission strip** — condensed, links to `/vision-mission`.
6. **Core values** — Innovation & Technical Excellence · Customer-Centric ·
   Integrity & Trust · Quality & Reliability · Partnership & Growth.
7. **Gallery preview** — a few images, link to `/media/photo-gallery`.
8. **Partners** — logo marquee (partner logos exist on current site).
9. **Contact / CTA band** + footer.

### About Us `/about`
Full company story (use the copy in §9). Founder mention with link to the
founder message page. Company stats (founded 2024, 15+ years expertise, 100+
clients). CTA to products/contact.

### Message from Founder & CEO `/about/founder-message`
Portrait + name **Mr. Billal Hossain Bappi**, Founder & CEO. Message body
(rich text). Signature block.

### What We Offer / Products `/products`
Grid of **categories** (dynamic). Each card: image, name, short desc, link to
`/products/[category]`. Intro copy = the "What We Offer" paragraph (§9).

### Category page `/products/[category]`
Category header (name, rich description, hero image) + grid of **products** in
that category. Each product card links to the product detail page.
`generateStaticParams` from categories; ISR to pick up new categories.

### Product detail `/products/[category]/[product]`
Image gallery (multiple images), product name, summary, **rich HTML content**
(rendered through the sanitized prose component), optional spec list, breadcrumb
(Home / Products / Category / Product), and a "related products" row.
`generateStaticParams` + ISR.

### Vision & Mission `/vision-mission`
Vision + Mission (copy in §9) + the 5 Core Values, each with an icon and a line.

### Global Sourcing `/global-sourcing`
Global partner/warehouse network narrative: sourcing world-class manufacturers,
warehouses, channel partners, uninterrupted supply, fast response. (Placeholder
copy is fine; mark it for client review.)

### Our Story `/our-story`
Company journey / timeline (founded 2024, founder's vision, growth). A vertical
timeline component works well here.

### Company `/company`
Company overview / profile page (confirm intended content with client). Include
downloadable company profile CTA placeholder.

### Media Centre `/media`
Hub with three entry cards → News, Photo Gallery, Video Gallery.
- **News** `/media/news` (list) + `/media/news/[slug]` (article, rich HTML, cover
  image, publish date).
- **Photo Gallery** `/media/photo-gallery` — masonry/lightbox grid.
- **Video Gallery** `/media/video-gallery` — cards from **YouTube links**; use the
  lightweight thumbnail-facade → iframe-on-click pattern (§5.6).

### Career `/career`
Intro + **application form** (modeled on the zexora career form). Fields:
Full Name, Email, Phone, Position Applied For (select or text), Cover Letter
(textarea), **Resume upload** (PDF/DOC). Validate with zod. On submit → POST to
`/api/career` (Phase 2). Show clear success/empty/error states in the interface's
own voice (no apologetic copy). Optionally list open positions above the form.

### Contact `/contact`
Contact form (Name, Email, Phone, Subject, Message → `/api/contact`), plus:
- Phone: **+880 1855 939 450**
- Email: **info@proactive.com.bd**
- Address: **292, Inner Circular Road, Shatabdi Centre, Fakirapool, Motijheel,
  Dhaka-1000**
- Lazy-loaded Google Map embed for that address.

### Global (layout)
- **Header:** logo, nav with dropdowns (§4), "Get in Touch" CTA, mobile drawer.
- **Footer:** logo, quick links, contact info, socials
  (Facebook `/proactivetradeInt`, LinkedIn `/company/proactivetradeint`,
  Instagram `/proactivetradeint`, YouTube `@proactivetradeint`), map, copyright
  "© 2026 Proactive Trade International".

---

## 8. Data models (`lib/types.ts`)

```ts
export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;   // rich HTML (from Summernote later)
  image: string;
  order: number;
  seo?: Seo;
}

export interface Product {
  id: string;
  slug: string;
  categorySlug: string;
  name: string;
  images: string[];
  summary: string;
  content: string;       // rich HTML
  specs?: { label: string; value: string }[];
  order: number;
  seo?: Seo;
}

export interface NewsPost {
  id: string; slug: string; title: string;
  coverImage: string; excerpt: string; content: string; // rich HTML
  publishedAt: string; seo?: Seo;
}

export interface GalleryImage { id: string; src: string; caption?: string; album?: string; }
export interface Video { id: string; title: string; youtubeId: string; publishedAt?: string; }

export interface CareerApplication {
  fullName: string; email: string; phone: string;
  position: string; coverLetter: string; resumeUrl: string;
}
export interface ContactMessage {
  name: string; email: string; phone?: string; subject: string; message: string;
}
export interface Seo { title?: string; description?: string; ogImage?: string; }
```

Rich HTML fields must be rendered through **one** sanitized component
(`<RichText html={...} />`) styled with a `.prose` class — never raw
`dangerouslySetInnerHTML` scattered around.

---

## 9. Seed content (real, use for mock data)

**About / company (verbatim from client):**
> ONE-STOP PRINTING & PACKAGING SOLUTIONS. Founded in 2024, Proactive Trade
> International is a trusted printing and packaging solutions provider in
> Bangladesh… serves 100+ top-tier printing & packaging companies. Founder & CEO:
> Mr. Billal Hossain Bappi. 15+ years of expertise in printing & packaging
> machineries and consumables. End-to-end performance solutions, warehouses +
> global channel partners, dedicated Technical Support & CRM teams.
> *(Full paragraph provided by client — paste in full on About page.)*

**Vision:** To become a leading and trusted technology partner in the printing and
packaging industry through innovation, excellence, and sustainable growth.

**Mission:** To deliver advanced machineries and high-performance consumables
supported by expert technical service and customized solutions that enhance
productivity and efficiency.

**Core Values:** Innovation & Technical Excellence · Customer-Centric Approach ·
Integrity & Trust · Quality & Reliability · Partnership & Growth.

**Categories (seed):**
1. Machineries Solutions
2. Press Room Chemicals Solutions
3. Inks & Coatings Solutions
4. Blankets, Plates, Adhesives & Papers Solutions

**Sample products (seed under Machineries):** CTP Machine, CTCP Machine, Flexo CTP
Machine. (Also referenced in "What We Offer": Offset Printing Machines, UV Coating,
Paper Cutting, Die Cutting, Lamination, Folder Gluer, Paper Bag & Rigid Box making,
Konica Minolta digital, DTF, Sublimation. Consumables: fountain solutions, blanket/
roller washes incl. UV & Flexo wash, plate cleaners, anti-set-off spray powder,
inks (offset sheetfed/UV/LED/Flexo), coatings & varnishes, rubber blankets, thermal
CTP & UV-CTCP plates, adhesives, specialty papers, spare parts.)

**Contact / socials:** see §7 Contact + Footer.

Put all of this in `lib/data/mock/*.ts` so pages render fully before the backend exists.

---

## 10. Suggested project structure

```
app/
  layout.tsx  ·  page.tsx  ·  globals.css
  about/(page + founder-message/page)
  products/(page + [category]/page + [category]/[product]/page)
  vision-mission/page.tsx
  global-sourcing/page.tsx
  our-story/page.tsx
  company/page.tsx
  media/(page + news/… + photo-gallery/page + video-gallery/page)
  career/page.tsx
  contact/page.tsx
  api/(career/route.ts · contact/route.ts)      // Phase 2
components/
  layout/(Header, Nav, MobileDrawer, Footer)
  ui/(Button, Card, Section, Eyebrow, Breadcrumbs, RichText, Skeleton)
  motion/(RegistrationHero, RevealOnView, HalftoneBg, CropMarks)
  media/(YouTubeFacade, Lightbox, PartnerMarquee)
  forms/(CareerForm, ContactForm)
lib/(data/… · types.ts · utils.ts)
public/(images, logo, fonts if not via next/font)
```

---

## 11. "Do NOT repeat previous issues" checklist

The old stack was WordPress + Elementor. Avoid its failure modes:
- ❌ No page builders, no Elementor-style DOM bloat, no unused CSS/JS.
- ❌ No render-blocking external font/CSS `<link>`s → use `next/font`, self-host.
- ❌ No raw `<img>` for content, no unsized media (kills CLS) → `next/image` + dimensions.
- ❌ No eager YouTube iframes or eager map → lazy facades.
- ❌ No giant client bundles → RSC by default, code-split motion/carousels.
- ❌ No unmaintainable content → everything dynamic flows through the data layer + dashboard later.
- ✅ Clean semantic HTML, real SEO metadata (`generateMetadata`), sitemap.xml, robots.txt, Open Graph.
- ✅ Mobile-first, keyboard-accessible, reduced-motion friendly.
- ✅ One design system, tokens in CSS variables, no inline style sprawl.

---

## 12. Build order (do this sequence)

1. Scaffold Next.js + TS + Tailwind; set tokens & fonts (§6); build Header/Footer/layout.
2. Build the `lib/data` layer with mock seed content (§9) and types (§8).
3. Home page with the CMYK registration hero + all sections (§7).
4. Products system: `/products` → category → product detail (ISR + static params).
5. About, Founder Message, Vision & Mission, Global Sourcing, Our Story, Company.
6. Media Centre: hub, News (list+detail), Photo Gallery (lightbox), Video Gallery (YT facade).
7. Career form + Contact form + map (client components, validation, states).
8. SEO (metadata/sitemap/robots/OG), performance pass to hit §5 targets, a11y pass.
9. Configure `next.config.js` for the chosen cPanel mode (§3); document deploy steps.
10. Handoff notes describing exactly which `lib/data` functions the backend must implement.

---

## 13. Backend handoff (Phase 2 — do not build yet)

When the dashboard is built, it must implement the same function signatures the
frontend already calls in `lib/data`. Dashboard scope for reference: CRUD for
Categories, Products (images + Summernote rich content), News, Gallery images,
Videos (YouTube links); inbox for Career applications (with resume files) and
Contact messages; global settings (contact info, socials, map). Frontend switches
from `mock` to `remote` by changing one file. Keep it that clean.
