/**
 * Static marketing copy (CLAUDE.md §9). Kept out of the page components so an
 * editor can change wording without touching JSX — and so these blocks can move
 * behind the dashboard later without a rewrite.
 *
 * Blocks marked FOR CLIENT REVIEW are drafted placeholders.
 */

export const aboutIntro =
  'Founded in 2024, Proactive Trade International is a trusted printing and packaging solutions provider in Bangladesh, serving 100+ top-tier printing and packaging companies with machineries, consumables and the technical support that keeps them running.';

export const aboutBody = `
  <p><strong>ONE-STOP PRINTING &amp; PACKAGING SOLUTIONS.</strong> Founded in 2024,
  Proactive Trade International is a trusted printing and packaging solutions
  provider in Bangladesh. Under the leadership of our Founder &amp; CEO,
  <strong>Mr. Billal Hossain Bappi</strong>, who brings over 15 years of expertise
  in printing and packaging machineries and consumables, the company serves more
  than 100 top-tier printing and packaging companies across the country.</p>

  <p>We are not a parts supplier. We deliver <strong>end-to-end performance
  solutions</strong> — sourcing world-class machineries, holding deep consumable
  stock in our own warehouses, and standing behind every installation with
  dedicated Technical Support and CRM teams. Our global channel partners give our
  customers access to manufacturers they could not reach alone, and our local
  warehousing turns import lead times into same-week deliveries.</p>

  <p>From computer-to-plate systems and offset presses to post-press automation,
  press room chemistry, inks, coatings, blankets, plates, adhesives and specialty
  papers, everything we supply is chosen against one test: can we service it, and
  can we keep it stocked? That discipline is why printing houses across Bangladesh
  build their production planning around us.</p>
`;

export const founderMessage = `
  <p>When I started Proactive Trade International, I had already spent more than
  fifteen years on the factory floor of this industry — commissioning machines,
  troubleshooting press rooms, and watching good printing houses lose production
  days waiting for a part or a plate that should have been on the shelf.</p>

  <p>That is the problem this company was built to solve. We do not simply import
  and sell. We select manufacturers we can stand behind, we hold stock locally so
  our customers are not hostage to shipping schedules, and we invest in engineers
  and CRM staff who know your press by name.</p>

  <p>Our commitment is straightforward: <strong>advanced machineries,
  high-performance consumables, and technical service that shows up.</strong> As
  Bangladesh's printing and packaging industry grows into higher-value work, our
  role is to make sure the technology and the support behind it grow with it.</p>

  <p>To every customer who has trusted us since 2024 — thank you. To those
  considering us, come and see how we work. We will be judged on uptime, not on
  brochures.</p>
`;

export const vision =
  'To become a leading and trusted technology partner in the printing and packaging industry through innovation, excellence, and sustainable growth.';

export const mission =
  'To deliver advanced machineries and high-performance consumables supported by expert technical service and customized solutions that enhance productivity and efficiency.';

export interface ValueItem {
  title: string;
  description: string;
  /** lucide-react icon name, resolved at the page level. */
  icon: 'Cpu' | 'Users' | 'ShieldCheck' | 'BadgeCheck' | 'Handshake';
}

export const coreValues: ValueItem[] = [
  {
    title: 'Innovation & Technical Excellence',
    description:
      'We bring proven technology to the press room and the engineering depth to run it properly.',
    icon: 'Cpu',
  },
  {
    title: 'Customer-Centric Approach',
    description:
      'Solutions are specified against your substrate, your run lengths and your production calendar.',
    icon: 'Users',
  },
  {
    title: 'Integrity & Trust',
    description:
      'Honest specification, honest lead times. We do not sell equipment we cannot service.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Quality & Reliability',
    description:
      'Consumables held to consistent batch specification, so the sheet you print today matches next month.',
    icon: 'BadgeCheck',
  },
  {
    title: 'Partnership & Growth',
    description:
      'We invest in long-term relationships with both our manufacturers and our customers.',
    icon: 'Handshake',
  },
];

export interface WhyItem {
  title: string;
  description: string;
  icon: 'Globe2' | 'Wrench' | 'PackageCheck' | 'Headset';
}

export const whyChooseUs: WhyItem[] = [
  {
    title: 'World-class manufacturers',
    description:
      'Direct agreements with established machinery and consumable manufacturers across Asia and Europe — selected on build quality and parts availability.',
    icon: 'Globe2',
  },
  {
    title: 'Technical support that shows up',
    description:
      'Field engineers for installation, commissioning and preventive maintenance, plus operator training with every machinery handover.',
    icon: 'Wrench',
  },
  {
    title: 'Stock held locally',
    description:
      'Warehouses in Dhaka carrying plates, blankets, inks and press room chemicals, so a reorder is a delivery, not an import cycle.',
    icon: 'PackageCheck',
  },
  {
    title: 'A named contact, not a call centre',
    description:
      'A dedicated CRM desk manages your reorder schedule, maintenance bookings and escalations end to end.',
    icon: 'Headset',
  },
];

/** FOR CLIENT REVIEW — Global Sourcing narrative. */
export const globalSourcing = {
  intro:
    'Sourcing is where uptime is won or lost. Our global network exists so that a machine specified in Dhaka is supported by a manufacturer, a spare-part channel and a consumable supply line that were arranged before the order was signed.',
  body: `
    <p>Proactive Trade International works with manufacturers and channel partners
    across Asia and Europe to bring world-class printing and packaging technology
    into Bangladesh — with the supply chain behind it already in place.</p>

    <h2>How our sourcing works</h2>
    <p>Every manufacturer relationship is assessed on three criteria before we
    represent them: proven build quality in comparable production conditions,
    committed spare-part availability, and willingness to train our engineers
    directly. A manufacturer that cannot meet all three is not a partner we sign.</p>

    <h2>Warehousing and channel partners</h2>
    <p>Our warehousing holds the consumables that stop a press when they run out.
    Combined with our channel partner network, that means shorter lead times on
    plates, blankets, inks and chemistry — and a fast response when a customer's
    schedule changes without warning.</p>

    <h2>Uninterrupted supply</h2>
    <p>For high-volume accounts we operate consignment and scheduled-replenishment
    arrangements, so consumable stock is planned against your production calendar
    rather than reordered under pressure.</p>
  `,
  pillars: [
    {
      title: 'Global manufacturer network',
      description: 'Direct relationships across Asia and Europe, assessed on quality, parts and training support.',
    },
    {
      title: 'Local warehousing',
      description: 'Deep consumable stock held in Dhaka — same-week delivery instead of import lead times.',
    },
    {
      title: 'Channel partnerships',
      description: 'Regional partners extending our reach into specialist equipment and materials.',
    },
    {
      title: 'Fast response',
      description: 'Engineering and CRM teams positioned to answer within the shift, not the week.',
    },
  ],
};

export interface TimelineEntry {
  year: string;
  title: string;
  description: string;
}

/** FOR CLIENT REVIEW — Our Story timeline. */
export const storyTimeline: TimelineEntry[] = [
  {
    year: 'Before 2024',
    title: 'Fifteen years on the floor',
    description:
      'Mr. Billal Hossain Bappi spends over a decade and a half in printing and packaging machineries and consumables — commissioning equipment, running service calls and learning where the industry actually loses production time.',
  },
  {
    year: '2024',
    title: 'Proactive Trade International is founded',
    description:
      'The company launches in Dhaka with a single principle: supply only what you can service, and stock what your customers cannot afford to wait for.',
  },
  {
    year: '2024 – 2025',
    title: 'Machinery and consumables portfolio built out',
    description:
      'Agreements signed across CTP and CTCP systems, offset and post-press machinery, press room chemistry, inks, coatings, blankets, plates and adhesives.',
  },
  {
    year: '2025',
    title: 'Warehousing and technical teams established',
    description:
      'Local warehousing comes online alongside a dedicated Technical Support and CRM structure, converting import lead times into same-week deliveries.',
  },
  {
    year: '2026',
    title: '100+ companies served',
    description:
      'Proactive Trade International now supports more than a hundred top-tier printing and packaging companies across Bangladesh, with nationwide field engineering coverage.',
  },
];

/** FOR CLIENT REVIEW — Company page. */
export const companyProfile = {
  intro:
    'Proactive Trade International is a Dhaka-based supplier of printing and packaging machineries and consumables, operating across Bangladesh with global sourcing partnerships and local warehousing.',
  body: `
    <p>We operate as a single point of accountability for printing and packaging
    production: machinery selection and commissioning, consumable supply, technical
    service and spare parts, managed by one team.</p>

    <h2>What we do</h2>
    <ul>
      <li>Supply and commission printing, converting and post-press machinery</li>
      <li>Supply press room chemicals, inks, coatings, plates, blankets, adhesives and papers</li>
      <li>Provide installation, operator training and preventive maintenance</li>
      <li>Hold local consumable stock and manage scheduled replenishment</li>
    </ul>

    <h2>Who we serve</h2>
    <p>Commercial printers, carton and rigid box manufacturers, flexible packaging
    converters and label producers — from single-press operations to multi-shift
    packaging plants.</p>

    <h2>How we are structured</h2>
    <p>Sales, field engineering, warehousing and CRM operate as one chain. The
    engineer who commissions your machine and the CRM officer who schedules your
    consumables work from the same account record, so nothing is handed off and
    dropped.</p>
  `,
  facts: [
    { label: 'Founded', value: '2024' },
    { label: 'Head office', value: 'Motijheel, Dhaka' },
    { label: 'Customers served', value: '100+' },
    { label: 'Leadership experience', value: '15+ years' },
    { label: 'Coverage', value: 'Nationwide, Bangladesh' },
    { label: 'Industry', value: 'Printing & packaging supply' },
  ],
};

/**
 * Parent / mother company block on /company.
 *
 * FOR CLIENT REVIEW — the group name and URL are taken from the old site, whose
 * "Company" menu item pointed at zexora.com.bd. The wording of the relationship
 * (ownership vs. affiliation) and the legal entity name must be confirmed before
 * launch, and the logo is a placeholder.
 */
export const parentCompany = {
  name: 'Zexora',
  url: 'https://zexora.com.bd',
  logo: '/images/about/parent-company-logo.png',
  role: 'Parent group',
  description:
    'Proactive Trade International operates as part of Zexora, the parent group behind its sourcing relationships and shared corporate services. The group connection is what gives us direct manufacturer agreements, the working capital to hold consumable stock locally, and the operational backing of a larger organisation behind every supply commitment.',
};

/** What We Offer intro paragraph, used on /products. */
export const whatWeOfferIntro = `
  <p>Proactive Trade International supplies the full production chain for printing
  and packaging: machineries, press room chemicals, inks and coatings, and the
  blankets, plates, adhesives and papers that decide what lands on the sheet.</p>
  <p>Machinery includes offset printing machines, CTP, CTCP and Flexo CTP systems,
  UV coating, paper cutting, die cutting, lamination, folder gluer, paper bag and
  rigid box making lines, Konica Minolta digital presses, DTF and sublimation
  systems. Consumables include fountain solutions, blanket and roller washes
  (including UV and Flexo wash), plate cleaners, anti-set-off spray powder, offset
  sheetfed, UV, LED and Flexo inks, coatings and varnishes, rubber blankets,
  thermal CTP and UV-CTCP plates, adhesives, specialty papers and spare parts.</p>
`;

/* ------------------------------ Our Solutions ----------------------------- */

export interface SolutionItem {
  slug: string;
  title: string;
  image: string;
}

export const solutionsIntro =
  'Eight production disciplines — from commercial print and packaging to corrugation, publishing and the consumables that keep them running.';

/**
 * The eight solution disciplines shown on the home page. Presentational for
 * now: image + title only, no detail route. When the dashboard owns these,
 * this array becomes `getSolutions()` in `lib/data` and gains a `slug` route.
 */
export const solutions: SolutionItem[] = [
  {
    slug: 'commercial-printing',
    title: 'Commercial Printing Solutions',
    image: '/images/solutions/commercial-printing.png',
  },
  {
    slug: 'packaging',
    title: 'Packaging Solutions',
    image: '/images/solutions/packaging.png',
  },
  {
    slug: 'label-printing',
    title: 'Label Printing Solutions',
    image: '/images/solutions/label-printing.png',
  },
  {
    slug: 'corrugation',
    title: 'Corrugation Solutions',
    image: '/images/solutions/corrugation.png',
  },
  {
    slug: 'newspaper-printing',
    title: 'Newspaper Printing Solutions',
    image: '/images/solutions/newspaper-printing.png',
  },
  {
    slug: 'publishing',
    title: 'Publishing Solutions',
    image: '/images/solutions/publishing.png',
  },
  {
    slug: 'digital-printing',
    title: 'Digital Printing Solutions',
    image: '/images/solutions/digital-printing.png',
  },
  {
    slug: 'consumables',
    title: 'Consumables Solutions',
    image: '/images/solutions/consumables.png',
  },
];

/* ---------------------------- Our Capabilities ---------------------------- */

export const capabilities = {
  title: 'Technical Expertise. Reliable Supply. Responsive Support.',
  lede: 'We combine industry knowledge, technical expertise, and supply capabilities to support our customers throughout the product and solution lifecycle.',
  body: 'From product selection and application guidance to supply coordination, technical assistance, installation, training, troubleshooting, and after-sales support where applicable, our team is focused on helping customers achieve reliable performance and uninterrupted operations.',
  /** The support surface, pulled out of `body` so it can be scanned. */
  services: [
    'Product selection',
    'Application guidance',
    'Supply coordination',
    'Technical assistance',
    'Installation',
    'Training',
    'Troubleshooting',
    'After-sales support',
  ],
  /** "Our approach is simple:" — the four steps, in order. */
  approach: [
    { step: 'Understand', detail: 'the requirement' },
    { step: 'Recommend', detail: 'the right solution' },
    { step: 'Deliver', detail: 'reliably' },
    { step: 'Remain available', detail: 'when support is needed' },
  ],
};
