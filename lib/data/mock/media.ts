import type { GalleryImage, Partner, Video } from '@/lib/types';

export const galleryImages: GalleryImage[] = [
  { id: 'g-1', src: '/images/gallery/gallery-01.png', album: 'Installations', caption: 'CTP installation and commissioning, Dhaka' },
  { id: 'g-2', src: '/images/gallery/gallery-02.png', album: 'Press Room', caption: 'Sheetfed offset press in production' },
  { id: 'g-3', src: '/images/gallery/gallery-03.png', album: 'Press Room', caption: 'Colour bar inspection on the press sheet' },
  { id: 'g-4', src: '/images/gallery/gallery-04.png', album: 'Warehouse', caption: 'Plate and blanket stock, Dhaka warehouse' },
  { id: 'g-5', src: '/images/gallery/gallery-05.png', album: 'Installations', caption: 'Flexo CTP handover and operator training' },
  { id: 'g-6', src: '/images/gallery/gallery-06.png', album: 'Team', caption: 'Technical support team briefing' },
  { id: 'g-7', src: '/images/gallery/gallery-07.png', album: 'Press Room', caption: 'UV coating line running gloss finish' },
  { id: 'g-8', src: '/images/gallery/gallery-08.png', album: 'Events', caption: 'Industry exhibition stand' },
  { id: 'g-9', src: '/images/gallery/gallery-09.png', album: 'Warehouse', caption: 'Press room chemical consignment stock' },
  { id: 'g-10', src: '/images/gallery/gallery-10.png', album: 'Team', caption: 'CRM desk, customer scheduling' },
  { id: 'g-11', src: '/images/gallery/gallery-11.png', album: 'Installations', caption: 'Die cutting line installation' },
  { id: 'g-12', src: '/images/gallery/gallery-12.png', album: 'Events', caption: 'Customer technical workshop' },
];

/**
 * Videos are stored as YouTube IDs only — the page renders a lightweight
 * thumbnail facade and swaps in the iframe on click (CLAUDE.md §5.6).
 * Placeholder IDs — replace with the client's real channel uploads.
 */
export const videos: Video[] = [
  { id: 'v-1', title: 'Proactive Trade International — company overview', youtubeId: 'aqz-KE-bpKQ', publishedAt: '2026-05-02' },
  { id: 'v-2', title: 'CTP plate-making workflow walkthrough', youtubeId: 'ScMzIvxBSi4', publishedAt: '2026-03-15' },
  { id: 'v-3', title: 'UV coating line in production', youtubeId: 'ktvTqknDobU', publishedAt: '2026-01-20' },
  { id: 'v-4', title: 'Press room chemistry: holding ink/water balance', youtubeId: 'jNQXAC9IVRw', publishedAt: '2025-12-08' },
  { id: 'v-5', title: 'Flexo CTP: flat-top dot explained', youtubeId: 'YE7VzlLtp-4', publishedAt: '2025-10-30' },
  { id: 'v-6', title: 'Inside our Dhaka warehouse', youtubeId: 'e-ORhEE9VVg', publishedAt: '2025-09-12' },
];

export const partners: Partner[] = [
  { id: 'pt-1', name: 'Konica Minolta', logo: '/images/partners/partner-01.png' },
  { id: 'pt-2', name: 'Amsky', logo: '/images/partners/partner-02.png' },
  { id: 'pt-3', name: 'Cron', logo: '/images/partners/partner-03.png' },
  { id: 'pt-4', name: 'Huber Group', logo: '/images/partners/partner-04.png' },
  { id: 'pt-5', name: 'Trelleborg', logo: '/images/partners/partner-05.png' },
  { id: 'pt-6', name: 'Fujifilm', logo: '/images/partners/partner-06.png' },
  { id: 'pt-7', name: 'Kodak', logo: '/images/partners/partner-07.png' },
  { id: 'pt-8', name: 'Bottcher', logo: '/images/partners/partner-08.png' },
];
