/**
 * COLLECTION REGISTRY.
 *
 * Categories, Products, News, Gallery, Videos and Job Openings all need the
 * same five screens: list, create, edit, delete, reorder. Rather than five
 * near-identical sets of routes and actions, each collection is described once
 * here — its zod schema, its editable fields, its list columns and what to
 * revalidate — and one generic set of screens and actions serves all of them.
 *
 * The field descriptors reuse the same shape the section editor generates from
 * zod (lib/sections/introspect.ts), so <FieldRenderer/> renders both.
 */
import { z } from 'zod';

import type { FieldDescriptor } from './sections/introspect';

/** Slug rule shared by every collection that has one. */
const slugField = z
  .string()
  .min(1, 'A slug is required.')
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens.');

/* -------------------------------------------------------------------------- */
/* Schemas                                                                     */
/* -------------------------------------------------------------------------- */

export const categoryInput = z.object({
  slug: slugField,
  name: z.string().min(1, 'A name is required.').max(200),
  description: z.string().default(''),
  image: z.string().default(''),
  order: z.number().int().min(0).default(0),
  seoTitle: z.string().max(200).default(''),
  seoDescription: z.string().max(320).default(''),
});

export const productInput = z.object({
  slug: slugField,
  categorySlug: z.string().min(1, 'Choose a category.'),
  name: z.string().min(1, 'A name is required.').max(250),
  images: z.array(z.string()).default([]),
  summary: z.string().default(''),
  content: z.string().default(''),
  specs: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .default([]),
  order: z.number().int().min(0).default(0),
  seoTitle: z.string().max(200).default(''),
  seoDescription: z.string().max(320).default(''),
});

export const newsInput = z.object({
  slug: slugField,
  title: z.string().min(1, 'A title is required.').max(300),
  coverImage: z.string().default(''),
  excerpt: z.string().default(''),
  content: z.string().default(''),
  publishedAt: z.string().min(1, 'Set a publish date.'),
  seoTitle: z.string().max(200).default(''),
  seoDescription: z.string().max(320).default(''),
});

export const galleryInput = z.object({
  src: z.string().min(1, 'Choose an image.'),
  caption: z.string().max(300).default(''),
  album: z.string().max(160).default(''),
  order: z.number().int().min(0).default(0),
});

export const videoInput = z.object({
  title: z.string().min(1, 'A title is required.').max(300),
  youtubeId: z
    .string()
    .min(1, 'Paste a YouTube link or ID.')
    .max(40)
    .regex(/^[A-Za-z0-9_-]{6,20}$/, 'That is not a YouTube video ID.'),
  publishedAt: z.string().default(''),
  order: z.number().int().min(0).default(0),
});

export const partnerInput = z.object({
  name: z.string().min(1, 'A name is required.').max(200),
  logo: z.string().min(1, 'Choose a logo.'),
  order: z.number().int().min(0).default(0),
});

export const jobInput = z.object({
  title: z.string().min(1, 'A title is required.').max(250),
  location: z.string().max(200).default(''),
  type: z.string().max(80).default(''),
  summary: z.string().default(''),
  order: z.number().int().min(0).default(0),
});

/* -------------------------------------------------------------------------- */
/* Field descriptors (what the editor renders)                                 */
/* -------------------------------------------------------------------------- */

const f = (
  name: string,
  label: string,
  kind: FieldDescriptor['kind'],
  extra: Partial<FieldDescriptor> = {},
): FieldDescriptor => ({ name, label, kind, required: false, ...extra });

const seoFields: FieldDescriptor[] = [
  f('seoTitle', 'Search title', 'text'),
  f('seoDescription', 'Search description', 'textarea'),
];

export type CollectionKey =
  | 'categories'
  | 'products'
  | 'news'
  | 'gallery'
  | 'videos'
  | 'partners'
  | 'jobs';

export interface CollectionDef {
  key: CollectionKey;
  /** Plural label for lists and headings. */
  label: string;
  /** Singular label for buttons ("Add category"). */
  singular: string;
  lede: string;
  schema: z.ZodTypeAny;
  fields: FieldDescriptor[];
  /** Which field to show as the row's name in the list. */
  titleField: string;
  /** Optional second line in the list row. */
  subtitleField?: string;
  /** Field holding a thumbnail, if any. */
  imageField?: string;
  /** Auto-fill the slug from this field when creating. */
  slugFrom?: string;
  blank: Record<string, unknown>;
}

export const collections: Record<CollectionKey, CollectionDef> = {
  categories: {
    key: 'categories',
    label: 'Categories',
    singular: 'category',
    lede: 'The four solution lines. These drive /products, the home grid and the "What We Offer" menu.',
    schema: categoryInput,
    titleField: 'name',
    subtitleField: 'slug',
    imageField: 'image',
    slugFrom: 'name',
    fields: [
      f('name', 'Name', 'text', { required: true }),
      f('slug', 'URL slug', 'text', { required: true }),
      f('image', 'Image', 'image'),
      f('description', 'Description', 'html'),
      f('order', 'Order', 'number'),
      ...seoFields,
    ],
    blank: {
      slug: '', name: '', description: '', image: '', order: 0,
      seoTitle: '', seoDescription: '',
    },
  },

  products: {
    key: 'products',
    label: 'Products',
    singular: 'product',
    lede: 'Everything under a category. Each product gets its own page with a gallery, summary and full description.',
    schema: productInput,
    titleField: 'name',
    subtitleField: 'categorySlug',
    slugFrom: 'name',
    fields: [
      f('name', 'Name', 'text', { required: true }),
      f('slug', 'URL slug', 'text', { required: true }),
      // Options are filled in at render time from the live category list.
      f('categorySlug', 'Category', 'select', { required: true, options: [] }),
      f('images', 'Images', 'objectList', {
        fields: [f('src', 'Image', 'image')],
        itemDefault: { src: '' },
      }),
      f('summary', 'Summary', 'textarea'),
      f('content', 'Description', 'html'),
      f('specs', 'Specifications', 'objectList', {
        fields: [f('label', 'Label', 'text'), f('value', 'Value', 'text')],
        itemDefault: { label: '', value: '' },
      }),
      f('order', 'Order', 'number'),
      ...seoFields,
    ],
    blank: {
      slug: '', categorySlug: '', name: '', images: [], summary: '', content: '',
      specs: [], order: 0, seoTitle: '', seoDescription: '',
    },
  },

  news: {
    key: 'news',
    label: 'News',
    singular: 'article',
    lede: 'Articles shown at /media/news. The newest one also fronts the Media Centre card.',
    schema: newsInput,
    titleField: 'title',
    subtitleField: 'publishedAt',
    imageField: 'coverImage',
    slugFrom: 'title',
    fields: [
      f('title', 'Title', 'text', { required: true }),
      f('slug', 'URL slug', 'text', { required: true }),
      f('publishedAt', 'Published', 'text', { required: true }),
      f('coverImage', 'Cover image', 'image'),
      f('excerpt', 'Excerpt', 'textarea'),
      f('content', 'Article', 'html'),
      ...seoFields,
    ],
    blank: {
      slug: '', title: '', coverImage: '', excerpt: '', content: '',
      publishedAt: '', seoTitle: '', seoDescription: '',
    },
  },

  gallery: {
    key: 'gallery',
    label: 'Gallery',
    singular: 'image',
    lede: 'Photographs for /media/photo-gallery and the strip on the home page.',
    schema: galleryInput,
    titleField: 'caption',
    subtitleField: 'album',
    imageField: 'src',
    fields: [
      f('src', 'Image', 'image', { required: true }),
      f('caption', 'Caption', 'text'),
      f('album', 'Album', 'text'),
      f('order', 'Order', 'number'),
    ],
    blank: { src: '', caption: '', album: '', order: 0 },
  },

  videos: {
    key: 'videos',
    label: 'Videos',
    singular: 'video',
    lede: 'YouTube videos for /media/video-gallery. Paste a full link — the ID is extracted for you.',
    schema: videoInput,
    titleField: 'title',
    subtitleField: 'youtubeId',
    fields: [
      f('title', 'Title', 'text', { required: true }),
      f('youtubeId', 'YouTube link or ID', 'text', { required: true }),
      f('publishedAt', 'Published', 'text'),
      f('order', 'Order', 'number'),
    ],
    blank: { title: '', youtubeId: '', publishedAt: '', order: 0 },
  },

  partners: {
    key: 'partners',
    label: 'Partners',
    singular: 'partner',
    lede: 'Manufacturer and sourcing logos for the marquee on the home page.',
    schema: partnerInput,
    titleField: 'name',
    imageField: 'logo',
    fields: [
      f('name', 'Name', 'text', { required: true }),
      f('logo', 'Logo', 'image', { required: true }),
      f('order', 'Order', 'number'),
    ],
    blank: { name: '', logo: '', order: 0 },
  },

  jobs: {
    key: 'jobs',
    label: 'Job openings',
    singular: 'opening',
    lede: 'Vacancies listed above the application form. An empty list hides that section entirely.',
    schema: jobInput,
    titleField: 'title',
    subtitleField: 'location',
    fields: [
      f('title', 'Title', 'text', { required: true }),
      f('location', 'Location', 'text'),
      f('type', 'Employment type', 'text'),
      f('summary', 'Summary', 'textarea'),
      f('order', 'Order', 'number'),
    ],
    blank: { title: '', location: '', type: '', summary: '', order: 0 },
  },
};

export const collectionKeys = Object.keys(collections) as CollectionKey[];

export function isCollectionKey(value: string): value is CollectionKey {
  return Object.prototype.hasOwnProperty.call(collections, value);
}

/** "Machineries Solutions" → "machineries-solutions". */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 160);
}

/**
 * Accept a full YouTube URL or a bare ID. Editors paste links; the database
 * stores the ID the facade needs.
 */
export function youtubeId(input: string): string {
  const value = input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?.*\bv=)([A-Za-z0-9_-]{6,20})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{6,20})/,
    /(?:youtube\.com\/(?:embed|shorts|live)\/)([A-Za-z0-9_-]{6,20})/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }
  return value;
}
