import type { Category } from '@/lib/types';

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

/**
 * Primary navigation (CLAUDE.md §4). "What We Offer" is filled from the live
 * category list, so a category added in the dashboard appears in the menu.
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
        { label: 'Message from Founder & CEO', href: '/about/founder-message' },
      ],
    },
    {
      label: 'What We Offer',
      href: '/products',
      children: [
        { label: 'All Categories', href: '/products' },
        ...categories.map((c) => ({ label: c.name, href: `/products/${c.slug}` })),
      ],
    },
    { label: 'Vision & Mission', href: '/vision-mission' },
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
  { label: 'What We Offer', href: '/products' },
  { label: 'Vision & Mission', href: '/vision-mission' },
  { label: 'Global Sourcing', href: '/global-sourcing' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Company', href: '/company' },
  { label: 'Media Centre', href: '/media' },
  { label: 'Career', href: '/career' },
  { label: 'Contact', href: '/contact' },
];
