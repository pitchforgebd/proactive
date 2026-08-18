# TASK_STATE — Proactive Trade International website rebuild

Last updated: 2026-08-18 (header fix applied)
Spec: `CLAUDE.md` (single source of truth). Build order = CLAUDE.md §12.

---

## Status: Phase 1 frontend COMPLETE

Steps 1–10 of CLAUDE.md §12 are done. Both cPanel deploy modes build clean,
lint is clean, types are clean, and every route was smoke-tested against a
production server.

### Verification performed (2026-08-18)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npx next lint` | no warnings or errors |
| `npx next build` (Mode A, `DEPLOY_MODE=node`) | 39 routes, **87.3 kB** shared first-load JS |
| `DEPLOY_MODE=static npx next build` (Mode B) | clean, emits `out/` (188 files, incl. sitemap.xml + robots.txt) |
| All 14 routes over HTTP | 200; unknown path → 404 |
| `POST /api/contact` | valid → 200, invalid → 422, honeypot → 200 silent discard |
| `POST /api/career` (multipart) | valid → 200, missing CV → 422, wrong file type → 422 |
| Prerendered `/` HTML | `<h1>` is server-rendered text; 0 Google Font links; 0 eager iframes |

---

## What exists

**Config** — `package.json`, `tsconfig.json`, `next.config.js` (dual-mode,
commented), `tailwind.config.ts`, `postcss.config.js`, `.eslintrc.json`,
`.env.example`.

**Routes (all 14 + API)**
```
/                          /about                 /about/founder-message
/products                  /products/[category]   /products/[category]/[product]
/vision-mission            /global-sourcing       /our-story
/company                   /media                 /media/news
/media/news/[slug]         /media/photo-gallery   /media/video-gallery
/career                    /contact
app/not-found.tsx  app/sitemap.ts  app/robots.ts
app/products/loading.tsx  app/products/[category]/loading.tsx  app/media/news/loading.tsx
app/api/contact/route.node.ts  app/api/career/route.node.ts
```

**Components** — layout (Header, Nav, MobileDrawer, Footer, Logo, PageHero),
ui (Button, Card, Section, SectionHeading, Eyebrow, Breadcrumbs, RichText,
Skeleton, CTABand), motion (RegistrationHero, RevealOnView, HalftoneBg,
CropMarks, RouteSweep), media (YouTubeFacade, Lightbox, GalleryGrid,
PartnerMarquee, MapEmbed), forms (ContactForm, CareerForm, Field),
home (Hero, HeroSlider), products (ProductGallery).

**Data layer** — `lib/data/index.ts` (the only content API components import),
`lib/data/remote.ts` (Phase 2 swap-in), `lib/data/mock/*` (6 fixture files),
`lib/types.ts`, `lib/validation.ts`, `lib/nav.ts`, `lib/utils.ts`.

**Assets** — 60 generated placeholder PNGs in `public/images`, produced by
`scripts/generate-placeholders.mjs` (`npm run gen:images`).

**Docs** — `README.md` (deploy runbook for both cPanel modes),
`HANDOFF.md` (Phase 2 backend contract).

---

## Header fix (applied after the Phase 1 sign-off)

**Problem:** at the `xl` breakpoint (1280px) the header row needed ~1369px but
the container gives 1216px. Flex `nowrap` meant the overflow was absorbed
*inside* the nav items, so long labels ("Vision & Mission", "Global Sourcing")
broke onto a second line inside the 70px bar.

**Changes**
- `components/layout/Header.tsx` — removed the phone number link entirely
  (reclaims ~176px). `getSiteSettings()` and the `Phone` icon import went with
  it, since nothing else in the header used them. Added `shrink-0` to the logo
  and the action cluster so the nav is never the thing that gets squeezed.
- `components/layout/Nav.tsx` — `whitespace-nowrap` on every top-level link,
  every dropdown trigger and every dropdown entry, so a label *cannot* wrap
  regardless of available width. Item padding tightened `px-3` → `px-2.5` for
  headroom (active-underline insets moved `inset-x-3` → `inset-x-2.5` to match).
  `shrink-0` on the `<nav>`.

**Verified** by screenshotting the production standalone build in headless
Chrome at 1280px: single line, all 9 items plus the CTA, no phone number.

Phone number is still present in the footer, the CTA band and `/contact`, so
click-to-call is not lost sitewide — only the header. If you want it back on
mobile, the drawer footer next to "Get in Touch" is the natural place.

---

## Dev server "Internal Server Error" — resolved

**Cause (self-inflicted).** A `next dev` process from an earlier session was
still holding port 3000. The production `next build` runs done during Phase 1
verification overwrote `.next` underneath that live dev server, leaving it
pointing at build artifacts that no longer matched. Windows then allowed a
second process to bind the same port when `npm run dev` was run again, so
requests landed on the broken server — Internal Server Error, then hangs.

**Fix.** Killed every process on port 3000, deleted `.next`, restarted `npm run
dev`. No source change was required; nothing in the codebase was at fault.

**Verified after the fix:** all 19 routes return 200 in dev, the dev log is free
of errors and warnings, and `POST /api/contact` behaves correctly in dev
(valid → 200, invalid → 422) — worth checking because the `route.node.ts`
naming is unusual.

**Avoid the repeat:** do not run `next build` while `next dev` is live against
the same `.next`. If dev misbehaves, the reliable reset is:

```bash
# stop anything on :3000, then
rm -rf .next && npm run dev
```

---

## Decisions worth knowing before touching the code

1. **API routes are named `route.node.ts`, not `route.ts`.** Static export
   cannot serve POST handlers and fails the build outright. `pageExtensions` in
   `next.config.js` registers them in Mode A and omits them in Mode B. Renaming
   them back to `route.ts` will break `DEPLOY_MODE=static npm run build`.

2. **The honeypot field must be permissive in the schema.** `website` accepts a
   value so the route handler can answer `200 {"ok":true}` and discard silently.
   Rejecting it in zod returns 422 and tells the bot which field caught it.
   (This was found and fixed during smoke testing.)

3. **Framer Motion is loaded only by the lightbox**, via
   `dynamic(..., { ssr: false })`. Scroll reveals use a bare IntersectionObserver
   — do not "unify" them onto `whileInView`; it puts an animation runtime in the
   shared bundle.

4. **The hero headline is CSS-only, not JS.** `RegistrationHero` is a Server
   Component; the CMYK snap is a CSS keyframe. It is the LCP element — keep it
   off the JavaScript path.

5. Only `RichText` may use `dangerouslySetInnerHTML` for content (DOMPurify
   sanitized). The JSON-LD `<script>` blocks are the deliberate exception.

---

## Remaining work (not blockers, needs client/host input)

### Needs the client
- [ ] Replace all 60 placeholder images in `public/images` with real
      photography **at the same dimensions** — see the manifest at the bottom of
      `scripts/generate-placeholders.mjs`. Partner logos in
      `public/images/partners/` are abstract and must be swapped before launch.
- [ ] Review the blocks marked **FOR CLIENT REVIEW** in
      `lib/data/mock/content.ts`: Global Sourcing narrative, Our Story timeline,
      Company profile.
- [ ] Confirm intended `/company` page content (the old site pointed this menu
      at zexora.com.bd; here it is a normal internal page, per CLAUDE.md §4).
- [ ] Supply the real YouTube video IDs — `lib/data/mock/media.ts` currently
      holds public placeholder IDs.
- [ ] Supply the company profile PDF (the `/company` page has a request-by-email
      CTA standing in for the download).
- [ ] Confirm the paragraph in `aboutBody` matches the client's full verbatim
      copy (CLAUDE.md §9 notes the full paragraph was to be pasted in).

### Needs the host
- [ ] **Confirm whether cPanel offers "Setup Node.js App" (Node 18+).** This
      picks Mode A vs Mode B. Everything else in `README.md` follows from it.

### Not yet measured
- [ ] Run Lighthouse (mobile) against a production build to confirm the §5
      targets (LCP < 2.0s, CLS < 0.05, Perf ≥ 90). Structural rules are all in
      place and bundle size is verified, but no Lighthouse run has been done —
      it needs a deployed or locally served production build with real images.

### Phase 2 (explicitly out of scope for now — CLAUDE.md §13)
- [ ] Dashboard + database. The contract is written up in `HANDOFF.md`:
      implement the endpoints, then set `NEXT_PUBLIC_DATA_SOURCE=remote` and
      `NEXT_PUBLIC_API_BASE_URL`. No UI changes required.

---

## Exact next step

Nothing is half-finished in code. The next action is a decision, not a commit:

1. Ask the host whether Node.js hosting is available → fixes the deploy mode.
2. Collect real imagery and the client-review copy above.
3. Then deploy per `README.md` and run Lighthouse to close out §5.

If picking up development instead, the highest-value optional additions would
be: a `/products` search or filter, and news pagination once the article count
grows past a single page.
