import type { Category } from '@/lib/types';

export interface NavChild {
  label: string;
  href: string;
  /** Key into the icon map in components/layout/Nav.tsx (strings only — this
   *  object crosses the server→client boundary, so no components here). */
  icon?: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
  /** Footer link of a mega dropdown, e.g. "All categories →". */
  viewAll?: { label: string; href: string };
}

/** Pick a menu icon from a category's name, so new categories get a sensible
 *  one automatically. Falls back to a generic package. */
export function categoryIcon(name: string): string {
  const n = name.toLowerCase();
  if (/spare|part/.test(n)) return 'wrench';
  if (/machin|equipment/.test(n)) return 'cog';
  if (/digital/.test(n)) return 'printer';
  if (/chemical|wash|pressroom|press room/.test(n)) return 'flask';
  if (/flexo/.test(n)) return 'layers';
  if (/uv|coating|varnish/.test(n)) return 'sparkles';
  if (/ink/.test(n)) return 'droplets';
  if (/blanket/.test(n)) return 'scroll';
  if (/plate/.test(n)) return 'disc';
  if (/adhesive|glue/.test(n)) return 'blend';
  if (/paper|board/.test(n)) return 'filestack';
  return 'package';
}

/**
 * Primary navigation (CLAUDE.md §4). The Products dropdown is filled from the
 * live category list, so a category added in the dashboard appears in the menu.
 *
 * Note: on the old site the "Company" menu pointed at an external domain
 * (zexora.com.bd). Here it is a normal internal page — no external redirect.
 */
export function buildNav(categories: Category[]): NavItem[] {
  return [
    { label: 'Home', href: '/' },
    {
      label: 'About Us',
      href: '/about',
      children: [
        { label: 'About Us', href: '/about' },
        { label: 'Vision & Mission', href: '/vision-mission' },
        { label: 'LEADERSHIP MESSAGE', href: '/about/leadership-message' },
      ],
    },
    {
      label: 'Products',
      href: '/products',
      // Desktop shows "All categories" as the mega-menu footer link; the
      // mobile drawer has no footer, so it keeps it as the first child.
      viewAll: { label: 'All categories', href: '/products' },
      children: [
        { label: 'All Categories', href: '/products' },
        ...categories.map((c) => ({
          label: c.name,
          href: `/products/${c.slug}`,
          icon: categoryIcon(c.name),
        })),
      ],
    },
    { label: 'Global Sourcing', href: '/global-sourcing' },
    { label: 'Our Story', href: '/our-story' },
    { label: 'Company', href: '/company' },
    {
      label: 'Media Centre',
      href: '/media',
      children: [
        { label: 'News', href: '/media/news' },
        { label: 'Photo Gallery', href: '/media/photo-gallery' },
        { label: 'Video Gallery', href: '/media/video-gallery' },
      ],
    },
    { label: 'Career', href: '/career' },
  ];
}

/** Footer quick links — flat, no dropdowns. */
export const footerLinks: NavChild[] = [
  { label: 'About Us', href: '/about' },
  { label: 'Products', href: '/products' },
  { label: 'Vision & Mission', href: '/vision-mission' },
  { label: 'Global Sourcing', href: '/global-sourcing' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Company', href: '/company' },
  { label: 'Media Centre', href: '/media' },
  { label: 'Career', href: '/career' },
  { label: 'Contact', href: '/contact' },
];
