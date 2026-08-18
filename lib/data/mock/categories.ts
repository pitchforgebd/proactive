import type { Category } from '@/lib/types';

/** Seed categories (CLAUDE.md §9). Descriptions are rich HTML on purpose — the
 *  dashboard will produce the same shape from Summernote. */
export const categories: Category[] = [
  {
    id: 'cat-1',
    slug: 'machineries-solutions',
    name: 'Machineries Solutions',
    image: '/images/categories/machineries-solutions.png',
    order: 1,
    description: `
      <p>Production-grade printing and packaging machinery sourced from world-class
      manufacturers and commissioned by our own engineers. Every installation is
      backed by dedicated technical support, operator training and spare-part
      availability.</p>
      <ul>
        <li>Computer-to-Plate (CTP), CTCP and Flexo CTP systems</li>
        <li>Offset printing machines — sheetfed and UV configurations</li>
        <li>UV coating, lamination and varnishing lines</li>
        <li>Paper cutting, die cutting and folder gluer machines</li>
        <li>Paper bag and rigid box making machines</li>
        <li>Konica Minolta digital presses, DTF and sublimation systems</li>
      </ul>
    `,
    seo: {
      title: 'Printing & Packaging Machineries',
      description:
        'CTP, CTCP, offset, UV coating, die cutting, folder gluer, digital and DTF machinery supplied and commissioned across Bangladesh.',
    },
  },
  {
    id: 'cat-2',
    slug: 'press-room-chemicals-solutions',
    name: 'Press Room Chemicals Solutions',
    image: '/images/categories/press-room-chemicals-solutions.png',
    order: 2,
    description: `
      <p>A complete press room chemistry programme, matched to your substrate, ink
      system and press speed. Stable chemistry means fewer wash-ups, less waste and
      a predictable dot on every sheet.</p>
      <ul>
        <li>Fountain solutions and alcohol substitutes</li>
        <li>Blanket and roller washes, including UV and Flexo wash</li>
        <li>Plate cleaners, correctors and gum solutions</li>
        <li>Anti-set-off spray powder</li>
      </ul>
    `,
    seo: {
      title: 'Press Room Chemicals',
      description:
        'Fountain solutions, blanket and roller washes, UV and Flexo wash, plate cleaners and anti-set-off spray powder.',
    },
  },
  {
    id: 'cat-3',
    slug: 'inks-and-coatings-solutions',
    name: 'Inks & Coatings Solutions',
    image: '/images/categories/inks-and-coatings-solutions.png',
    order: 3,
    description: `
      <p>High-performance inks and coatings engineered for colour consistency at
      commercial run lengths. Supplied with density targets and curing guidance so
      the press room can hold register and gloss batch after batch.</p>
      <ul>
        <li>Offset sheetfed process and Pantone inks</li>
        <li>UV and LED-UV curable ink systems</li>
        <li>Flexo inks for flexible packaging and cartons</li>
        <li>Overprint varnishes, gloss and matt coatings</li>
      </ul>
    `,
    seo: {
      title: 'Printing Inks & Coatings',
      description:
        'Offset sheetfed, UV, LED-UV and Flexo ink systems plus coatings and varnishes for packaging production.',
    },
  },
  {
    id: 'cat-4',
    slug: 'blankets-plates-adhesives-papers-solutions',
    name: 'Blankets, Plates, Adhesives & Papers Solutions',
    image: '/images/categories/blankets-plates-adhesives-papers-solutions.png',
    order: 4,
    description: `
      <p>The consumables that decide print quality on the sheet: rubber blankets,
      thermal and UV-CTCP plates, packaging adhesives and specialty papers, held in
      our warehouses for uninterrupted supply.</p>
      <ul>
        <li>Rubber offset blankets and packings</li>
        <li>Thermal CTP and UV-CTCP printing plates</li>
        <li>Lamination, carton and rigid box adhesives</li>
        <li>Specialty papers and boards</li>
        <li>Spare parts for installed machinery</li>
      </ul>
    `,
    seo: {
      title: 'Blankets, Plates, Adhesives & Papers',
      description:
        'Rubber blankets, thermal CTP and UV-CTCP plates, adhesives, specialty papers and machine spare parts.',
    },
  },
];
