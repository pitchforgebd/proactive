/**
 * SECTION FIELD SCHEMAS — the single content contract.
 *
 * One zod object per section type. These schemas are used three times:
 *
 *   1. Rendering  — SectionRenderer validates `section.data` before handing it
 *                   to the component. Invalid data is skipped, never crashed on.
 *   2. Saving     — the dashboard validates on submit, server-side.
 *   3. Form build — the dashboard generates its editor UI from the schema
 *                   shape, using the `.describe()` widget hints below.
 *
 * They live in their own module (rather than inside registry.ts) so the section
 * components can import their own prop types without importing the registry —
 * the registry imports the components, so the other direction would cycle.
 *
 * WIDGET HINTS: `.describe()` carries the editor widget for a field.
 *   'html'     → Summernote rich-text editor (sanitized on save AND on render)
 *   'image'    → image uploader (stores a relative path)
 *   'textarea' → multi-line plain text
 *   'href'     → link input
 *   'icon'     → icon picker, limited to lib/sections/icons.ts
 * Anything else is a single-line text input, a number input, a select (enum) or
 * a toggle (boolean), inferred from the zod type.
 */
import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/* Field helpers                                                               */
/* -------------------------------------------------------------------------- */

export const WIDGET = {
  html: 'html',
  image: 'image',
  textarea: 'textarea',
  href: 'href',
  icon: 'icon',
} as const;

const html = () => z.string().describe(WIDGET.html);
const image = () => z.string().describe(WIDGET.image);
const textarea = () => z.string().describe(WIDGET.textarea);
const href = () => z.string().describe(WIDGET.href);
const icon = () => z.string().describe(WIDGET.icon);

/** Surface colour. Matches the `tone` prop on <Section/> — design stays coded. */
const tone = () => z.enum(['paper', 'paper-2', 'ink']);

/* -------------------------------------------------------------------------- */
/* Shared shapes                                                               */
/* -------------------------------------------------------------------------- */

/** Eyebrow + index + title + lede + optional "view more" link. */
const headingFields = {
  eyebrow: z.string().optional(),
  /** Registration index, e.g. "01" — part of the press-sheet identity. */
  index: z.string().optional(),
  title: z.string().optional(),
  lede: textarea().optional(),
  linkText: z.string().optional(),
  linkHref: href().optional(),
};

const ctaFields = {
  ctaText: z.string().optional(),
  ctaHref: href().optional(),
};

/* -------------------------------------------------------------------------- */
/* Section schemas                                                             */
/* -------------------------------------------------------------------------- */

export const heroSchema = z.object({
  eyebrow: z.string().optional(),
  /** One line per newline — rendered as separate display lines. */
  headline: textarea(),
  lede: textarea().optional(),
  primaryCtaText: z.string().optional(),
  primaryCtaHref: href().optional(),
  secondaryCtaText: z.string().optional(),
  secondaryCtaHref: href().optional(),
  slides: z
    .array(z.object({ image: image(), alt: z.string().optional() }))
    .min(1),
  stats: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .default([]),
});

export const pageHeroSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string(),
  lede: textarea().optional(),
  image: image().optional(),
  imageAlt: z.string().optional(),
  compact: z.boolean().default(false),
  crumbs: z
    .array(z.object({ label: z.string(), href: href().optional() }))
    .default([]),
});

export const richTextSchema = z.object({
  eyebrow: z.string().optional(),
  index: z.string().optional(),
  html: html(),
  tone: tone().default('paper-2'),
  cropMarks: z.boolean().default(true),
  /** Constrain the measure for body copy, or let it fill the grid. */
  narrow: z.boolean().default(true),
});

export const imageTextSchema = z.object({
  eyebrow: z.string().optional(),
  index: z.string().optional(),
  heading: z.string(),
  html: html(),
  image: image(),
  imageAlt: z.string().optional(),
  /** Which side the image sits on at large sizes. */
  side: z.enum(['left', 'right']).default('right'),
  imageAspect: z.enum(['4/3', '16/10']).default('4/3'),
  tone: tone().default('paper-2'),
  cropMarks: z.boolean().default(false),
  halftone: z.boolean().default(false),
  ...ctaFields,
  /** Optional stat plate overlapping the image edge. */
  badgeValue: z.string().optional(),
  badgeLabel: z.string().optional(),
});

export const statsSchema = z.object({
  items: z.array(z.object({ value: z.string(), label: z.string() })).min(1),
  tone: tone().default('paper-2'),
});

export const valueGridSchema = z.object({
  ...headingFields,
  items: z
    .array(
      z.object({
        icon: icon().optional(),
        title: z.string(),
        text: textarea().optional(),
      }),
    )
    .min(1),
  /** Coded layouts — the admin picks one, never authors it. */
  variant: z.enum(['hairline', 'rule', 'numbered', 'proof']).default('hairline'),
  columns: z.enum(['2', '3', '4', '5']).default('4'),
  tone: tone().default('paper-2'),
  halftone: z.boolean().default(false),
  cropMarks: z.boolean().default(false),
});

export const timelineSchema = z.object({
  ...headingFields,
  milestones: z
    .array(
      z.object({
        year: z.string(),
        title: z.string(),
        text: textarea().optional(),
      }),
    )
    .min(1),
  tone: tone().default('paper-2'),
  cropMarks: z.boolean().default(true),
});

export const visionMissionSchema = z.object({
  visionTitle: z.string().default('Vision'),
  visionText: textarea(),
  visionIcon: icon().optional(),
  missionTitle: z.string().default('Mission'),
  missionText: textarea(),
  missionIcon: icon().optional(),
  /** 'strip' = condensed home band · 'panels' = full page treatment with icons. */
  variant: z.enum(['strip', 'panels']).default('strip'),
  linkText: z.string().optional(),
  linkHref: href().optional(),
  tone: tone().default('paper'),
  cropMarks: z.boolean().default(false),
});

export const solutionsSchema = z.object({
  ...headingFields,
  tiles: z.array(z.object({ title: z.string(), image: image() })).min(1),
});

export const capabilitiesSchema = z.object({
  eyebrow: z.string().optional(),
  index: z.string().optional(),
  /** Sentences are split on "." and set as separate lines with a CMYK bullet. */
  title: z.string(),
  lede: textarea().optional(),
  body: textarea().optional(),
  services: z.array(z.string()).default([]),
  approachEyebrow: z.string().default('Our approach is simple'),
  approach: z
    .array(z.object({ step: z.string(), detail: z.string() }))
    .default([]),
  ...ctaFields,
});

export const globalNetworkSchema = z.object({
  eyebrow: z.string().optional(),
  /** One line per newline — last line renders in the accent colour. */
  heading: textarea(),
  html: html(),
  stats: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .max(4)
    .default([]),
  mapIcon: icon().optional(),
  mapHeading: z.string().default('Global Reach'),
  mapText: textarea().optional(),
  tone: tone().default('paper-2'),
});

export const countriesGridSchema = z.object({
  ...headingFields,
  countries: z
    .array(
      z.object({
        /** ISO 3166-1 alpha-2 — also used to render the flag. */
        code: z.string().length(2),
        name: z.string(),
        text: textarea().optional(),
      }),
    )
    .min(1),
  tone: tone().default('paper'),
});

export const categoryGridSchema = z.object({
  ...headingFields,
  /** 0 = every category. */
  limit: z.number().int().min(0).max(24).default(0),
  variant: z.enum(['cards4', 'cards2']).default('cards4'),
  showCount: z.boolean().default(false),
  rollerLine: z.boolean().default(false),
  tone: tone().default('paper'),
  cropMarks: z.boolean().default(false),
});

export const galleryPreviewSchema = z.object({
  ...headingFields,
  limit: z.number().int().min(1).max(24).default(6),
  tone: tone().default('ink'),
  halftone: z.boolean().default(true),
});

export const partnersSchema = z.object({
  title: z.string().optional(),
  tone: tone().default('paper-2'),
});

export const ctaSchema = z.object({
  eyebrow: z.string().default('Get in Touch'),
  heading: z.string(),
  text: textarea().optional(),
  buttonText: z.string().default('Contact Us'),
  buttonHref: href().default('/contact'),
});

export const richTextProfileAsideSchema = z.object({
  eyebrow: z.string().optional(),
  index: z.string().optional(),
  html: html(),
  tone: tone().default('paper'),
  cropMarks: z.boolean().default(true),
  asideImage: image(),
  asideImageAlt: z.string().optional(),
  asideEyebrow: z.string().optional(),
  asideName: z.string(),
  asideText: textarea().optional(),
  asideCtaText: z.string().optional(),
  asideCtaHref: href().optional(),
});

export const richTextFactsAsideSchema = z.object({
  eyebrow: z.string().optional(),
  index: z.string().optional(),
  html: html(),
  tone: tone().default('paper-2'),
  cropMarks: z.boolean().default(true),
  facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  boxEyebrow: z.string().optional(),
  boxText: textarea().optional(),
  boxCtaText: z.string().optional(),
  /** Composes mailto: against the address in Settings — no address hardcoded. */
  boxCtaMailSubject: z.string().optional(),
});

export const founderMessageSchema = z.object({
  image: image(),
  imageAlt: z.string().optional(),
  name: z.string(),
  role: z.string().optional(),
  quote: textarea().optional(),
  html: html(),
  signatureMark: z.string().optional(),
  signatureName: z.string().optional(),
  signatureRole: z.string().optional(),
  tone: tone().default('paper-2'),
  cropMarks: z.boolean().default(true),
});

export const parentCompanySchema = z.object({
  eyebrow: z.string().optional(),
  index: z.string().optional(),
  logo: image(),
  /**
   * Logo plate background. `band` (dark) suits light marks; `paper` suits dark
   * marks such as the DYNAMIK wordmark.
   */
  logoSurface: z.enum(['band', 'paper']).default('band'),
  name: z.string(),
  /** Optional line under the name (e.g. brand tagline). */
  tagline: z.string().optional(),
  description: textarea(),
  url: href().optional(),
  linkText: z.string().optional(),
  tone: tone().default('paper'),
});

export const mediaHubSchema = z.object({
  entries: z
    .array(
      z.object({
        title: z.string(),
        href: href(),
        description: textarea().optional(),
        image: image().optional(),
        /** Which collection supplies the live count on the card. */
        countFrom: z.enum(['news', 'gallery', 'videos', 'none']).default('none'),
        unit: z.string().optional(),
      }),
    )
    .min(1),
  tone: tone().default('paper-2'),
  cropMarks: z.boolean().default(true),
});

export const careerOpeningsSchema = z.object({
  ...headingFields,
  /** Shown under the list. The section hides itself when there are no openings. */
  footnote: textarea().optional(),
  tone: tone().default('paper-2'),
  cropMarks: z.boolean().default(true),
});

export const careerFormSchema = z.object({
  eyebrow: z.string().optional(),
  index: z.string().optional(),
  title: z.string().optional(),
  lede: textarea().optional(),
  tone: tone().default('paper'),
});

export const contactDetailsSchema = z.object({
  eyebrow: z.string().optional(),
  index: z.string().optional(),
  addressLabel: z.string().default('Address'),
  phoneLabel: z.string().default('Phone'),
  emailLabel: z.string().default('Email'),
  hoursLabel: z.string().default('Office hours'),
  hoursValue: z.string().optional(),
  hoursNote: textarea().optional(),
  followLabel: z.string().default('Follow'),
  formEyebrow: z.string().default('Send a message'),
  formIndex: z.string().optional(),
  tone: tone().default('paper-2'),
  cropMarks: z.boolean().default(true),
});

export const mapSchema = z.object({
  /** Blank uses the address query from Settings. */
  queryOverride: z.string().optional(),
  title: z.string().default('Office location'),
  height: z.enum(['sm', 'md', 'lg']).default('lg'),
});

/* -------------------------------------------------------------------------- */
/* Prop types — each section component types its props from its own schema      */
/* -------------------------------------------------------------------------- */

export type HeroData = z.infer<typeof heroSchema>;
export type PageHeroData = z.infer<typeof pageHeroSchema>;
export type RichTextData = z.infer<typeof richTextSchema>;
export type ImageTextData = z.infer<typeof imageTextSchema>;
export type StatsData = z.infer<typeof statsSchema>;
export type ValueGridData = z.infer<typeof valueGridSchema>;
export type TimelineData = z.infer<typeof timelineSchema>;
export type VisionMissionData = z.infer<typeof visionMissionSchema>;
export type SolutionsData = z.infer<typeof solutionsSchema>;
export type CapabilitiesData = z.infer<typeof capabilitiesSchema>;
export type GlobalNetworkData = z.infer<typeof globalNetworkSchema>;
export type CountriesGridData = z.infer<typeof countriesGridSchema>;
export type CategoryGridData = z.infer<typeof categoryGridSchema>;
export type GalleryPreviewData = z.infer<typeof galleryPreviewSchema>;
export type PartnersData = z.infer<typeof partnersSchema>;
export type CtaData = z.infer<typeof ctaSchema>;
export type RichTextProfileAsideData = z.infer<typeof richTextProfileAsideSchema>;
export type RichTextFactsAsideData = z.infer<typeof richTextFactsAsideSchema>;
export type FounderMessageData = z.infer<typeof founderMessageSchema>;
export type ParentCompanyData = z.infer<typeof parentCompanySchema>;
export type MediaHubData = z.infer<typeof mediaHubSchema>;
export type CareerOpeningsData = z.infer<typeof careerOpeningsSchema>;
export type CareerFormData = z.infer<typeof careerFormSchema>;
export type ContactDetailsData = z.infer<typeof contactDetailsSchema>;
export type MapData = z.infer<typeof mapSchema>;
