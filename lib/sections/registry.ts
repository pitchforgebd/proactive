/**
 * SECTION-TYPE REGISTRY — the coded catalog (PHASE2-BACKEND.md §6.3).
 *
 * This is the contract shared by three consumers:
 *   · SectionRenderer  — validates a section's data before rendering it
 *   · the dashboard    — lists the addable types and generates the edit form
 *   · the seed script  — writes default data for a new section
 *
 * METADATA ONLY — no React components are imported here. The components live
 * behind lazy loaders in lib/sections/components.ts, because a static import of
 * all 23 of them would put every section type's client JavaScript into every
 * page's first load (measured: 99.9 kB → 131 kB). It also keeps the public
 * site's components out of the dashboard bundle, which only needs the schemas.
 *
 * THE GUARDRAIL: new section types are added HERE, in code, by a developer.
 * The dashboard can add, reorder, hide and edit *instances* of these types —
 * it can never author layout, CSS or HTML structure. That is the difference
 * between this and the Elementor build it replaces.
 *
 * Adding a type:
 *   1. write the component in components/sections/ (prop-driven, design coded)
 *   2. add its zod schema to lib/sections/schemas.ts
 *   3. register it below with a label, group and default data
 *   4. add its loader to lib/sections/components.ts
 */
import type { z } from 'zod';

import * as S from './schemas';

/** Editor grouping — purely how the "add section" picker is organised. */
export type SectionGroup = 'Headers' | 'Content' | 'Collections' | 'Forms' | 'Closing';

interface SectionEntry<T extends z.ZodTypeAny = z.ZodTypeAny> {
  label: string;
  /** One line in the dashboard picker explaining what the type is for. */
  hint: string;
  group: SectionGroup;
  schema: T;
  /** Data written when an editor adds a fresh instance of this type. */
  defaults: z.input<T>;
}

const entry = <T extends z.ZodTypeAny>(e: SectionEntry<T>) => e;

export const sectionRegistry = {
  /* ---- Headers --------------------------------------------------------- */
  hero: entry({
    label: 'Hero / Slider',
    hint: 'Full-height home hero with the CMYK registration headline, slider and stat rail.',
    group: 'Headers',
    schema: S.heroSchema,
    defaults: {
      eyebrow: 'Printing & Packaging · Bangladesh',
      headline: 'One-Stop\nPrinting & Packaging\nSolutions.',
      lede: '',
      primaryCtaText: 'Explore Products',
      primaryCtaHref: '/products',
      secondaryCtaText: 'Get in Touch',
      secondaryCtaHref: '/contact',
      slides: [{ image: '/images/hero/hero-01.png', alt: '' }],
      stats: [],
    },
  }),

  pageHero: entry({
    label: 'Page Header Band',
    hint: 'Dark inner-page header: breadcrumb, eyebrow, title, lede and optional background image.',
    group: 'Headers',
    schema: S.pageHeroSchema,
    defaults: {
      eyebrow: '',
      title: 'Page title',
      lede: '',
      image: '',
      compact: false,
      crumbs: [{ label: 'Home', href: '/' }],
    },
  }),

  /* ---- Content --------------------------------------------------------- */
  richText: entry({
    label: 'Rich Text Block',
    hint: 'A block of formatted copy from the editor.',
    group: 'Content',
    schema: S.richTextSchema,
    defaults: { html: '<p>New text block.</p>', tone: 'paper-2', cropMarks: true, narrow: true },
  }),

  imageText: entry({
    label: 'Image + Text',
    hint: 'Two columns: copy on one side, a photograph on the other, with an optional stat plate.',
    group: 'Content',
    schema: S.imageTextSchema,
    defaults: {
      heading: 'Section heading',
      html: '<p>Supporting copy.</p>',
      image: '/images/about/about-company.png',
      side: 'right',
      imageAspect: '4/3',
      tone: 'paper-2',
      cropMarks: false,
      halftone: false,
    },
  }),

  richTextProfileAside: entry({
    label: 'Rich Text + Profile Card',
    hint: 'Long-form copy beside a sticky person card (portrait, name, role, link).',
    group: 'Content',
    schema: S.richTextProfileAsideSchema,
    defaults: {
      html: '<p>Long-form copy.</p>',
      tone: 'paper',
      cropMarks: true,
      asideImage: '/images/about/founder-portrait.png',
      asideName: 'Name',
    },
  }),

  richTextFactsAside: entry({
    label: 'Rich Text + Fact Sheet',
    hint: 'Long-form copy beside a sticky fact grid and an optional request-by-email box.',
    group: 'Content',
    schema: S.richTextFactsAsideSchema,
    defaults: { html: '<p>Long-form copy.</p>', tone: 'paper-2', cropMarks: true, facts: [] },
  }),

  founderMessage: entry({
    label: 'Founder Message',
    hint: 'Portrait, pull-quote, message body and signature block.',
    group: 'Content',
    schema: S.founderMessageSchema,
    defaults: {
      image: '/images/about/founder-portrait.png',
      name: 'Name',
      html: '<p>Message.</p>',
      tone: 'paper-2',
      cropMarks: true,
    },
  }),

  stats: entry({
    label: 'Stats Band',
    hint: 'A hairline grid of figures — founded, years, customers served.',
    group: 'Content',
    schema: S.statsSchema,
    defaults: { items: [{ value: '100+', label: 'Companies served' }], tone: 'paper-2' },
  }),

  valueGrid: entry({
    label: 'Value / Feature Grid',
    hint: 'Icon, title and text cells. Three coded layouts: hairline, rule or numbered.',
    group: 'Content',
    schema: S.valueGridSchema,
    defaults: {
      items: [{ icon: 'Sparkles', title: 'Value', text: '' }],
      variant: 'hairline',
      columns: '4',
      tone: 'paper-2',
      halftone: false,
      cropMarks: false,
    },
  }),

  timeline: entry({
    label: 'Timeline / Journey',
    hint: 'Vertical milestone list with a cyan-to-magenta registration rule.',
    group: 'Content',
    schema: S.timelineSchema,
    defaults: {
      milestones: [{ year: '2024', title: 'Milestone', text: '' }],
      tone: 'paper-2',
      cropMarks: true,
    },
  }),

  visionMission: entry({
    label: 'Vision & Mission',
    hint: 'The paired statements — condensed strip or full panels with icons.',
    group: 'Content',
    schema: S.visionMissionSchema,
    defaults: {
      visionTitle: 'Vision',
      visionText: '',
      missionTitle: 'Mission',
      missionText: '',
      variant: 'strip',
      tone: 'paper',
      cropMarks: false,
    },
  }),

  solutions: entry({
    label: 'Solution Tiles',
    hint: 'A dark grid of image tiles for the production disciplines you supply into.',
    group: 'Content',
    schema: S.solutionsSchema,
    defaults: {
      tiles: [{ title: 'Solution', image: '/images/solutions/commercial-printing.png' }],
    },
  }),

  capabilities: entry({
    label: 'Capabilities / Support',
    hint: 'The service promise: claim and service list on paper, numbered approach on ink.',
    group: 'Content',
    schema: S.capabilitiesSchema,
    defaults: {
      title: 'Technical Expertise. Reliable Supply. Responsive Support.',
      services: [],
      approachEyebrow: 'Our approach is simple',
      approach: [],
    },
  }),

  parentCompany: entry({
    label: 'Parent / Brand',
    hint: 'Logo plate with relationship or brand copy and an optional outbound link.',
    group: 'Content',
    schema: S.parentCompanySchema,
    defaults: {
      logo: '/images/about/parent-company-logo.png',
      logoSurface: 'band',
      name: 'Group name',
      description: '',
      tone: 'paper',
    },
  }),

  /* ---- Collections (content comes from the database, not this section) --- */
  categoryGrid: entry({
    label: 'Product Categories',
    hint: 'Cards for the product categories. Reads the Categories collection live.',
    group: 'Collections',
    schema: S.categoryGridSchema,
    defaults: {
      limit: 0,
      variant: 'cards4',
      showCount: false,
      rollerLine: false,
      tone: 'paper',
      cropMarks: false,
    },
  }),

  galleryPreview: entry({
    label: 'Gallery Preview',
    hint: 'A strip of recent photographs. Reads the Gallery collection live.',
    group: 'Collections',
    schema: S.galleryPreviewSchema,
    defaults: { limit: 6, tone: 'ink', halftone: true },
  }),

  partners: entry({
    label: 'Partner Logos',
    hint: 'Continuous logo marquee. Reads the Partners collection live.',
    group: 'Collections',
    schema: S.partnersSchema,
    defaults: { title: 'Sourcing partners & manufacturers', tone: 'paper-2' },
  }),

  mediaHub: entry({
    label: 'Media Centre Cards',
    hint: 'Entry cards for News, Photos and Videos, with live counts from each collection.',
    group: 'Collections',
    schema: S.mediaHubSchema,
    defaults: {
      entries: [
        { title: 'News', href: '/media/news', countFrom: 'news', unit: 'articles' },
      ],
      tone: 'paper-2',
      cropMarks: true,
    },
  }),

  careerOpenings: entry({
    label: 'Open Positions',
    hint: 'The current vacancies. Reads the Job Openings collection live; hides itself when empty.',
    group: 'Collections',
    schema: S.careerOpeningsSchema,
    defaults: { tone: 'paper-2', cropMarks: true },
  }),

  /* ---- Forms ------------------------------------------------------------ */
  careerForm: entry({
    label: 'Application Form',
    hint: 'The job application form, including CV upload.',
    group: 'Forms',
    schema: S.careerFormSchema,
    defaults: { title: 'Send us your application.', tone: 'paper' },
  }),

  contactDetails: entry({
    label: 'Contact Details + Form',
    hint: 'Office details from Settings beside the message form.',
    group: 'Forms',
    schema: S.contactDetailsSchema,
    defaults: {
      addressLabel: 'Address',
      phoneLabel: 'Phone',
      emailLabel: 'Email',
      hoursLabel: 'Office hours',
      followLabel: 'Follow',
      formEyebrow: 'Send a message',
      tone: 'paper-2',
      cropMarks: true,
    },
  }),

  map: entry({
    label: 'Map Band',
    hint: 'Full-bleed lazy-loaded map of the address in Settings.',
    group: 'Forms',
    schema: S.mapSchema,
    defaults: { title: 'Office location', height: 'lg' },
  }),

  /* ---- Closing ---------------------------------------------------------- */
  cta: entry({
    label: 'Call To Action Band',
    hint: 'Closing contact band. Phone and email come from Settings.',
    group: 'Closing',
    schema: S.ctaSchema,
    defaults: {
      eyebrow: 'Get in Touch',
      heading: 'Tell us what you print. We will specify the rest.',
      text: 'Machinery selection, consumable programmes, technical service — talk to our team about your production.',
      buttonText: 'Contact Us',
      buttonHref: '/contact',
    },
  }),
} as const;

export type SectionType = keyof typeof sectionRegistry;

export const sectionTypes = Object.keys(sectionRegistry) as SectionType[];

export function isSectionType(value: string): value is SectionType {
  return Object.prototype.hasOwnProperty.call(sectionRegistry, value);
}

/** Registry entry for a stored type string, or null if the type was removed. */
export function getSectionEntry(type: string) {
  return isSectionType(type) ? sectionRegistry[type] : null;
}

/** The "add section" picker, grouped. */
export const sectionGroups: SectionGroup[] = [
  'Headers',
  'Content',
  'Collections',
  'Forms',
  'Closing',
];
