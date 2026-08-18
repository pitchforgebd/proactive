import type { JobOpening, SiteSettings } from '@/lib/types';

export const siteSettings: SiteSettings = {
  companyName: 'Proactive Trade International',
  phone: '+880 1855 939 450',
  email: 'info@proactive.com.bd',
  address:
    '292, Inner Circular Road, Shatabdi Centre, Fakirapool, Motijheel, Dhaka-1000',
  mapQuery:
    'Shatabdi Centre, 292 Inner Circular Road, Fakirapool, Motijheel, Dhaka 1000, Bangladesh',
  socials: [
    { label: 'Facebook', href: 'https://www.facebook.com/proactivetradeInt' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/proactivetradeint' },
    { label: 'Instagram', href: 'https://www.instagram.com/proactivetradeint' },
    { label: 'YouTube', href: 'https://www.youtube.com/@proactivetradeint' },
  ],
};

/** Optional openings listed above the career form. Empty array is a valid state. */
export const jobOpenings: JobOpening[] = [
  {
    id: 'job-1',
    title: 'Field Service Engineer — Printing Machinery',
    location: 'Dhaka (field-based, nationwide travel)',
    type: 'Full time',
    summary:
      'Install, commission and service CTP, offset and post-press equipment. Diploma or degree in mechanical/electrical engineering with press room experience.',
  },
  {
    id: 'job-2',
    title: 'Technical Sales Executive — Consumables',
    location: 'Dhaka',
    type: 'Full time',
    summary:
      'Own a portfolio of press room chemicals, inks and plates. Comfortable talking density, pH and conductivity with production managers.',
  },
  {
    id: 'job-3',
    title: 'CRM & Customer Support Officer',
    location: 'Motijheel, Dhaka',
    type: 'Full time',
    summary:
      'Manage reorder schedules, maintenance bookings and customer communication for installed accounts.',
  },
];
