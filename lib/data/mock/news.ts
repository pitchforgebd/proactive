import type { NewsPost } from '@/lib/types';

/** Seed news posts. Placeholder editorial — mark for client review. */
export const news: NewsPost[] = [
  {
    id: 'n-1',
    slug: 'proactive-trade-international-expands-warehouse-capacity',
    title: 'Warehouse capacity expanded to keep consumables on the shelf',
    coverImage: '/images/news/warehouse-expansion.png',
    excerpt:
      'Additional storage in Dhaka shortens lead times on plates, blankets and press room chemicals for customers running continuous shifts.',
    publishedAt: '2026-06-18',
    content: `
      <p>Proactive Trade International has expanded its Dhaka warehousing to hold
      deeper stock of the consumables that stop a press when they run out — thermal
      and UV-CTCP plates, rubber blankets, fountain solution and wash.</p>
      <h2>Why it matters on the floor</h2>
      <p>Import lead times are the single biggest cause of unplanned downtime for
      packaging houses running two and three shifts. Holding local stock converts a
      multi-week wait into a same-week delivery.</p>
      <ul>
        <li>Deeper local stock across the four core consumable lines</li>
        <li>Faster dispatch to customers outside Dhaka</li>
        <li>Consignment arrangements available for high-volume accounts</li>
      </ul>
      <p>Customers can confirm current stock positions through their CRM contact.</p>
    `,
    seo: {
      description:
        'Expanded Dhaka warehousing shortens lead times on plates, blankets and press room chemicals.',
    },
  },
  {
    id: 'n-2',
    slug: 'flexo-ctp-commissioning-flexible-packaging',
    title: 'Flexo CTP commissioned for a flexible packaging producer',
    coverImage: '/images/news/flexo-ctp-commissioning.png',
    excerpt:
      'A 4000 dpi flat-top dot workflow replaces outsourced plate-making, cutting job turnaround from days to hours.',
    publishedAt: '2026-04-29',
    content: `
      <p>Our engineering team has completed the commissioning of a Flexo CTP system
      at a flexible packaging producer that previously outsourced all plate-making.</p>
      <h2>Results after the first month</h2>
      <ul>
        <li>Plate turnaround reduced from two days to under four hours</li>
        <li>Flat-top dot workflow holding the 1% highlight consistently</li>
        <li>Lower impression settings on solids, reducing substrate waste</li>
      </ul>
      <p>The installation included operator training, a plate and chemistry starter
      programme and a preventive maintenance schedule managed by our technical
      support team.</p>
    `,
    seo: {
      description:
        'Flexo CTP commissioning brings 4000 dpi flat-top dot plate-making in-house for a flexible packaging producer.',
    },
  },
  {
    id: 'n-3',
    slug: 'technical-support-team-expansion',
    title: 'Technical support and CRM teams expanded nationwide',
    coverImage: '/images/news/technical-support-team.png',
    excerpt:
      'More field engineers and a dedicated CRM desk mean scheduled preventive maintenance instead of emergency call-outs.',
    publishedAt: '2026-02-11',
    content: `
      <p>Machinery is only as good as the support behind it. Proactive Trade
      International has expanded both its field engineering team and its CRM desk to
      cover installed equipment across Bangladesh.</p>
      <h2>What customers get</h2>
      <ul>
        <li>Scheduled preventive maintenance visits, planned around your run calendar</li>
        <li>A named CRM contact for parts, chemistry and consumable reordering</li>
        <li>Faster diagnosis through remote support before an engineer is dispatched</li>
      </ul>
      <p>Existing customers will be contacted with their assigned engineer and CRM
      details.</p>
    `,
    seo: {
      description:
        'Expanded field engineering and CRM teams deliver scheduled preventive maintenance across Bangladesh.',
    },
  },
  {
    id: 'n-4',
    slug: 'partnership-world-class-manufacturers',
    title: 'New manufacturer partnerships broaden the machinery portfolio',
    coverImage: '/images/news/manufacturer-partnership.png',
    excerpt:
      'Agreements signed with additional press and post-press manufacturers add die cutting, folder gluer and rigid box lines.',
    publishedAt: '2025-11-24',
    content: `
      <p>New agreements with manufacturers across Asia and Europe extend our
      portfolio into post-press automation — die cutting, folder gluer, paper bag and
      rigid box making lines.</p>
      <p>Each partnership is selected on the same criteria we apply to everything we
      supply: proven build quality, spare-part availability, and a manufacturer
      willing to support our engineers with training.</p>
      <blockquote>We do not sell a machine we cannot service. That rule decides every
      partnership we sign.</blockquote>
      <p>Demonstration visits can be arranged through our sales team.</p>
    `,
    seo: {
      description:
        'New manufacturer partnerships add die cutting, folder gluer, paper bag and rigid box making lines to the portfolio.',
    },
  },
];
