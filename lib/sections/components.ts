/**
 * Lazy component loaders, one per section type.
 *
 * WHY LOADERS AND NOT DIRECT IMPORTS
 * SectionRenderer has to be able to render any section type, so a static import
 * map would make every section component — and every Client Component inside
 * them (the hero slider, both forms, the map, the GSAP wrappers) — part of the
 * module graph of every page. Measured on the first build after the routes were
 * converted: first-load JS went from 99.9 kB to 131 kB on pages that use none of
 * it. `() => import()` puts each one in its own async chunk, so a page only
 * pays for the section types it actually renders.
 *
 * Each entry must correspond to a key in lib/sections/registry.ts; the type
 * annotation below makes a missing or misspelled one a compile error.
 */
import type { ComponentType } from 'react';

import type { SectionType } from './registry';

// Section components may be async Server Components, which ComponentType does
// not describe, and their props are only known after a zod parse — so the
// renderer spreads validated data into an intentionally loose signature.
type SectionModule = { default: ComponentType<any> };
type SectionLoader = () => Promise<SectionModule>;

export const sectionComponents: Record<SectionType, SectionLoader> = {
  hero: () => import('@/components/sections/Hero'),
  pageHero: () => import('@/components/sections/PageHeroSection'),
  richText: () => import('@/components/sections/RichTextSection'),
  imageText: () => import('@/components/sections/ImageText'),
  richTextProfileAside: () => import('@/components/sections/RichTextProfileAside'),
  richTextFactsAside: () => import('@/components/sections/RichTextFactsAside'),
  founderMessage: () => import('@/components/sections/FounderMessage'),
  stats: () => import('@/components/sections/Stats'),
  valueGrid: () => import('@/components/sections/ValueGrid'),
  timeline: () => import('@/components/sections/Timeline'),
  visionMission: () => import('@/components/sections/VisionMission'),
  solutions: () => import('@/components/sections/Solutions'),
  capabilities: () => import('@/components/sections/Capabilities'),
  parentCompany: () => import('@/components/sections/ParentCompany'),
  globalNetwork: () => import('@/components/sections/GlobalNetwork'),
  countriesGrid: () => import('@/components/sections/CountriesGrid'),
  categoryGrid: () => import('@/components/sections/CategoryGrid'),
  galleryPreview: () => import('@/components/sections/GalleryPreview'),
  partners: () => import('@/components/sections/Partners'),
  mediaHub: () => import('@/components/sections/MediaHub'),
  careerOpenings: () => import('@/components/sections/CareerOpenings'),
  careerForm: () => import('@/components/sections/CareerFormSection'),
  contactDetails: () => import('@/components/sections/ContactDetails'),
  map: () => import('@/components/sections/MapSection'),
  cta: () => import('@/components/sections/CTA'),
};
