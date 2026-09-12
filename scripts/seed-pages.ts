/**
 * PAGE + SECTION SEED DATA
 *
 * Reproduces the Phase 1 layout of all 11 fixed pages as database rows: the
 * same sections, in the same order, with the same content. Nothing here is new
 * copy — the long-form text is imported from lib/data/mock/content.ts, which is
 * where CLAUDE.md §9's seed content already lives, so there is no second copy
 * to drift.
 *
 * `sec()` type-checks each section's data against that section type's zod
 * schema at compile time; the seed runner validates again at runtime before
 * writing, so a schema change that invalidates this file fails loudly.
 */
import type { z } from 'zod';

import type { SectionType, sectionRegistry } from '../lib/sections/registry';
import {
  aboutBody,
  aboutIntro,
  capabilities,
  companyProfile,
  coreValues,
  dynamikBrand,
  founderMessage,
  globalNetworkBody,
  globalNetworkStats,
  globalSourcing,
  mission,
  parentCompany,
  solutions,
  solutionsIntro,
  sourcingCountries,
  storyTimeline,
  vision,
  whatWeOfferIntro,
  whyChooseUs,
} from '../lib/data/mock/content';
import { PAGE_SLUGS, pageLabels, type PageSlug } from '../lib/pages';

type DataFor<T extends SectionType> = z.input<(typeof sectionRegistry)[T]['schema']>;

export interface SeedSection {
  type: SectionType;
  visible: boolean;
  data: unknown;
}

/** Typed section constructor — `data` must satisfy `type`'s schema. */
function sec<T extends SectionType>(
  type: T,
  data: DataFor<T>,
  visible = true,
): SeedSection {
  return { type, visible, data };
}

export interface SeedPage {
  slug: PageSlug;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  sections: SeedSection[];
}

/* -------------------------------------------------------------------------- */
/* Shared content                                                              */
/* -------------------------------------------------------------------------- */

const HOME = { label: 'Home', href: '/' };

/** Phase 1 rendered these value lists with icons picked by array index; they
 *  are stored by name now so reordering in the dashboard cannot reshuffle them. */
const coreValueItems = coreValues.map((v) => ({
  icon: v.icon,
  title: v.title,
  text: v.description,
}));

const whyChooseUsItems = whyChooseUs.map((v) => ({
  icon: v.icon,
  title: v.title,
  text: v.description,
}));

const sourcingPillarIcons = ['Globe2', 'PackageCheck', 'Users', 'Timer'];
const sourcingPillarItems = globalSourcing.pillars.map((p, i) => ({
  icon: sourcingPillarIcons[i] ?? 'Globe2',
  title: p.title,
  text: p.description,
}));

const defaultCta = {
  eyebrow: 'Get in Touch',
  heading: 'Tell us what you print. We will specify the rest.',
  text: 'Machinery selection, consumable programmes, technical service — talk to our team about your production.',
  buttonText: 'Contact Us',
  buttonHref: '/contact',
};

/* -------------------------------------------------------------------------- */
/* Pages                                                                       */
/* -------------------------------------------------------------------------- */

export const seedPages: SeedPage[] = [
  /* ---- Home ------------------------------------------------------------- */
  {
    slug: 'home',
    title: 'Home',
    seoTitle: 'Proactive Trade International — One-Stop Printing & Packaging Solutions',
    seoDescription:
      'Trusted supplier of printing and packaging machineries, press room chemicals, inks, coatings and consumables in Bangladesh. Serving 100+ printing and packaging companies.',
    sections: [
      sec('hero', {
        eyebrow: 'Printing & Packaging · Bangladesh',
        headline: 'One-Stop\nPrinting & Packaging\nSolutions.',
        lede: 'A trusted supplier of printing and packaging machineries, press room chemicals, inks, coatings and consumables — serving 100+ top-tier printing and packaging companies across Bangladesh.',
        primaryCtaText: 'Explore Products',
        primaryCtaHref: '/products',
        secondaryCtaText: 'Get in Touch',
        secondaryCtaHref: '/contact',
        slides: [
          { image: '/images/hero/hero-01.png', alt: '' },
          { image: '/images/hero/hero-02.png', alt: '' },
          { image: '/images/hero/hero-03.png', alt: '' },
        ],
        stats: [
          { value: '100+', label: 'Companies served' },
          { value: '15+', label: 'Years of expertise' },
          { value: '2024', label: 'Founded' },
        ],
      }),

      sec('imageText', {
        eyebrow: 'About Proactive Trade International',
        index: '01',
        heading: 'A supplier that is measured on your uptime, not on its catalogue.',
        html: `<p>${aboutIntro}</p><p>We deliver end-to-end performance solutions — world-class machineries, consumables held in our own warehouses, and dedicated Technical Support and CRM teams behind every installation.</p>`,
        image: '/images/about/about-company.png',
        imageAlt:
          'Proactive Trade International supplying printing and packaging production',
        side: 'right',
        imageAspect: '4/3',
        tone: 'paper-2',
        cropMarks: true,
        halftone: false,
        ctaText: 'View More',
        ctaHref: '/about',
        badgeValue: '100+',
        badgeLabel: 'Companies served',
      }),

      sec('solutions', {
        eyebrow: 'Our Solutions',
        index: '02',
        title: 'Comprehensive solutions for the printing and packaging industry.',
        lede: solutionsIntro,
        linkText: 'View Products',
        linkHref: '/products',
        tiles: solutions.map((s) => ({ title: s.title, image: s.image })),
      }),

      sec('categoryGrid', {
        eyebrow: 'What We Offer',
        index: '03',
        title: 'Four solution lines, one point of accountability.',
        lede: 'Machineries, press room chemicals, inks and coatings, and the consumables that decide print quality on the sheet.',
        linkText: 'Explore all products',
        linkHref: '/products',
        limit: 8,
        variant: 'cards4',
        showCount: false,
        rollerLine: true,
        tone: 'paper',
        cropMarks: false,
      }),

      sec('valueGrid', {
        eyebrow: 'Why Choose Us',
        index: '04',
        title: 'Anyone can quote a machine. Fewer can keep it running.',
        items: whyChooseUsItems,
        variant: 'proof',
        columns: '4',
        tone: 'ink',
        halftone: true,
        cropMarks: false,
      }),

      sec('capabilities', {
        eyebrow: 'Our Capabilities / Technical Support',
        index: '05',
        title: capabilities.title,
        lede: capabilities.lede,
        body: capabilities.body,
        services: [...capabilities.services],
        approachEyebrow: 'Our approach is simple',
        approach: capabilities.approach.map((a) => ({ step: a.step, detail: a.detail })),
        ctaText: 'Talk to our technical team',
        ctaHref: '/contact',
      }),

      sec('globalNetwork', {
        eyebrow: 'Strategic Network',
        heading: 'World-Class Quality,\nSourced Globally.',
        html: `<p>${globalNetworkBody}</p>`,
        stats: globalNetworkStats,
        mapIcon: 'Globe2',
        mapHeading: 'Global Reach',
        mapText: 'Seamless integration from international manufacturers directly to local industries.',
        tone: 'paper-2',
      }),

      sec('visionMission', {
        visionTitle: 'Vision',
        visionText: vision,
        missionTitle: 'Mission',
        missionText: mission,
        variant: 'strip',
        linkText: 'Vision & Mission in full',
        linkHref: '/vision-mission',
        tone: 'paper',
        cropMarks: false,
      }),

      sec('valueGrid', {
        eyebrow: 'Core Values',
        index: '06',
        title: 'Five commitments we are willing to be held to.',
        items: coreValueItems,
        variant: 'rule',
        columns: '5',
        tone: 'paper-2',
        halftone: false,
        cropMarks: false,
      }),

      sec('galleryPreview', {
        eyebrow: 'Photo Gallery',
        index: '07',
        title: 'Installations, press rooms and the people behind them.',
        linkText: 'View Gallery',
        linkHref: '/media/photo-gallery',
        limit: 6,
        tone: 'ink',
        halftone: true,
      }),

      sec('partners', {
        title: 'Sourcing partners & manufacturers',
        tone: 'paper-2',
      }),

      sec('cta', defaultCta),
    ],
  },

  /* ---- About ------------------------------------------------------------ */
  {
    slug: 'about',
    title: 'About Us',
    seoTitle: 'About Us',
    seoDescription: aboutIntro,
    sections: [
      sec('pageHero', {
        eyebrow: 'About Us',
        title: 'One-stop printing & packaging solutions.',
        lede: aboutIntro,
        image: '/images/about/about-company.png',
        compact: false,
        crumbs: [HOME, { label: 'About Us' }],
      }),

      sec('stats', {
        items: [
          { value: '2024', label: 'Founded' },
          { value: '15+', label: 'Years of expertise' },
          { value: '100+', label: 'Companies served' },
          { value: '4', label: 'Solution lines' },
        ],
        tone: 'paper-2',
      }),

      sec('richTextProfileAside', {
        eyebrow: 'Our company',
        index: '01',
        html: aboutBody,
        tone: 'paper',
        cropMarks: true,
        asideImage: '/images/about/founder-portrait.png',
        asideImageAlt:
          'Mr. Billal Hossain Bappi, Founder & CEO of Proactive Trade International',
        asideEyebrow: 'Founder & CEO',
        asideName: 'Mr. Billal Hossain Bappi',
        asideText:
          'Over 15 years of expertise in printing and packaging machineries and consumables — and the reason this company measures itself on uptime rather than order volume.',
        asideCtaText: 'Read his message',
        asideCtaHref: '/about/leadership-message',
      }),

      sec('cta', {
        ...defaultCta,
        heading: 'Come and see how we work.',
        text: 'Ask us for references from printing houses running the machinery and consumables we supply.',
      }),
    ],
  },

  /* ---- Leadership message ----------------------------------------------- */
  {
    slug: 'leadership-message',
    title: 'Leadership Message',
    seoTitle: 'Leadership Message',
    seoDescription:
      'A leadership message from Mr. Billal Hossain Bappi, Founder & CEO of Proactive Trade International, on why the company was built around service and local stock.',
    sections: [
      sec('pageHero', {
        eyebrow: 'About Us',
        title: 'Leadership Message',
        compact: false,
        crumbs: [HOME, { label: 'About Us', href: '/about' }, { label: 'Leadership Message' }],
      }),

      sec('founderMessage', {
        image: '/images/about/founder-portrait.png',
        imageAlt: 'Portrait of Mr. Billal Hossain Bappi, Founder & CEO',
        name: 'Mr. Billal Hossain Bappi',
        role: 'Founder & CEO',
        quote: 'We will be judged on uptime, not on brochures.',
        html: founderMessage,
        signatureMark: 'B. H. Bappi',
        signatureName: 'Mr. Billal Hossain Bappi',
        signatureRole: 'Founder & CEO · Proactive Trade International',
        tone: 'paper-2',
        cropMarks: true,
      }),

      sec('cta', defaultCta),
    ],
  },

  /* ---- Vision & Mission -------------------------------------------------- */
  {
    slug: 'vision-mission',
    title: 'Vision & Mission',
    seoTitle: 'Vision & Mission',
    seoDescription: `${vision} ${mission}`,
    sections: [
      sec('pageHero', {
        eyebrow: 'Vision & Mission',
        title: 'Where we are going, and how we get there.',
        image: '/images/about/vision-mission.png',
        compact: false,
        crumbs: [HOME, { label: 'Vision & Mission' }],
      }),

      sec('visionMission', {
        visionTitle: 'Vision',
        visionText: vision,
        visionIcon: 'Compass',
        missionTitle: 'Mission',
        missionText: mission,
        missionIcon: 'Target',
        variant: 'panels',
        tone: 'paper-2',
        cropMarks: true,
      }),

      sec('valueGrid', {
        eyebrow: 'Core Values',
        index: '01',
        title: 'Five commitments we are willing to be held to.',
        lede: 'These are not wall posters. They are the tests we apply before we sign a manufacturer, quote a machine or accept an order.',
        items: coreValueItems,
        variant: 'numbered',
        columns: '3',
        tone: 'ink',
        halftone: true,
        cropMarks: false,
      }),

      sec('cta', {
        ...defaultCta,
        heading: 'Hold us to it.',
        text: 'Ask our existing customers whether the service matches the statement.',
      }),
    ],
  },

  /* ---- Products / What We Offer ------------------------------------------ */
  {
    slug: 'products',
    title: 'What We Offer',
    seoTitle: 'What We Offer — Printing & Packaging Solutions',
    seoDescription:
      'Machineries, press room chemicals, inks and coatings, blankets, plates, adhesives and papers — the full production chain for printing and packaging.',
    sections: [
      sec('pageHero', {
        eyebrow: 'What We Offer',
        title: 'Everything the press room runs on.',
        lede: 'Four solution lines covering machineries, press room chemistry, inks and coatings, and the consumables that decide print quality on the sheet.',
        compact: false,
        crumbs: [HOME, { label: 'What We Offer' }],
      }),

      sec('richText', {
        html: whatWeOfferIntro,
        tone: 'paper-2',
        cropMarks: true,
        narrow: true,
      }),

      sec('categoryGrid', {
        limit: 0,
        variant: 'cards2',
        showCount: true,
        rollerLine: false,
        tone: 'paper',
        cropMarks: false,
      }),

      sec('cta', {
        ...defaultCta,
        heading: 'Not sure which line you need? Describe the job.',
        text: 'Tell us the substrate, run length and finish you are aiming for — we will specify the machinery and consumables around it.',
      }),
    ],
  },

  /* ---- Global Sourcing ---------------------------------------------------- */
  {
    slug: 'global-sourcing',
    title: 'Global Sourcing',
    seoTitle: 'Global Sourcing',
    seoDescription: globalSourcing.intro,
    sections: [
      sec('pageHero', {
        eyebrow: 'Global Sourcing',
        title: 'A supply chain arranged before the order is signed.',
        lede: globalSourcing.intro,
        image: '/images/about/global-sourcing.png',
        compact: false,
        crumbs: [HOME, { label: 'Global Sourcing' }],
      }),

      sec('globalNetwork', {
        eyebrow: 'Strategic Network',
        heading: 'World-Class Quality,\nSourced Globally.',
        html: `<p>${globalNetworkBody}</p>`,
        stats: globalNetworkStats,
        mapIcon: 'Globe2',
        mapHeading: 'Global Reach',
        mapText: 'Seamless integration from international manufacturers directly to local industries.',
        tone: 'paper-2',
      }),

      sec('countriesGrid', {
        title: 'Countries We Source From',
        lede: 'A strategic footprint across key industrial manufacturing hubs globally.',
        countries: sourcingCountries,
        tone: 'paper',
      }),

      sec('valueGrid', {
        items: sourcingPillarItems,
        variant: 'hairline',
        columns: '4',
        tone: 'paper-2',
        halftone: false,
        cropMarks: false,
      }),

      sec('richText', {
        eyebrow: 'How the network runs',
        index: '01',
        html: globalSourcing.body,
        tone: 'paper',
        cropMarks: true,
        narrow: false,
      }),

      sec('cta', {
        ...defaultCta,
        heading: 'Need a manufacturer we do not list?',
        text: 'Tell us the specification. Our sourcing team will find it, assess it against our criteria, and quote it with a parts plan attached.',
      }),
    ],
  },

  /* ---- Our Story ---------------------------------------------------------- */
  {
    slug: 'our-story',
    title: 'Our Story',
    seoTitle: 'Our Story',
    seoDescription:
      'From fifteen years on the factory floor to serving 100+ printing and packaging companies — the story of Proactive Trade International.',
    sections: [
      sec('pageHero', {
        eyebrow: 'Our Story',
        title: 'Built by someone who had already fixed the problem.',
        lede: 'Proactive Trade International started on the factory floor, not in a boardroom. Here is how it got here.',
        image: '/images/about/our-story.png',
        compact: false,
        crumbs: [HOME, { label: 'Our Story' }],
      }),

      sec('timeline', {
        eyebrow: 'Timeline',
        index: '01',
        title: 'The journey so far.',
        milestones: storyTimeline.map((m) => ({
          year: m.year,
          title: m.title,
          text: m.description,
        })),
        tone: 'paper-2',
        cropMarks: true,
      }),

      sec('imageText', {
        heading: 'The next chapter is the one you are in.',
        html: '<p>Bangladesh&#39;s printing and packaging industry is moving into higher-value work — tighter tolerances, shorter runs, more finishing. Our job is to make sure the technology and the support behind it move at the same pace.</p>',
        image: '/images/gallery/gallery-05.png',
        imageAlt: 'Machinery handover and operator training on site',
        side: 'right',
        imageAspect: '16/10',
        tone: 'ink',
        cropMarks: false,
        halftone: true,
      }),

      sec('cta', defaultCta),
    ],
  },

  /* ---- Company ------------------------------------------------------------ */
  {
    slug: 'company',
    title: 'Company',
    seoTitle: 'Company',
    seoDescription: companyProfile.intro,
    sections: [
      sec('pageHero', {
        eyebrow: 'Company',
        title: 'Company profile.',
        lede: companyProfile.intro,
        image: '/images/about/company-profile.png',
        compact: false,
        crumbs: [HOME, { label: 'Company' }],
      }),

      sec('richTextFactsAside', {
        eyebrow: 'Overview',
        index: '01',
        html: companyProfile.body,
        tone: 'paper-2',
        cropMarks: true,
        facts: companyProfile.facts.map((f) => ({ label: f.label, value: f.value })),
        boxEyebrow: 'Company profile',
        boxText:
          'A downloadable PDF profile is being prepared. Request a copy and we will send it directly.',
        boxCtaText: 'Request profile',
        boxCtaMailSubject: 'Request: Company profile PDF',
      }),

      sec('parentCompany', {
        eyebrow: parentCompany.role,
        index: '02',
        logo: parentCompany.logo,
        logoSurface: 'band',
        name: parentCompany.name,
        description: parentCompany.description,
        url: parentCompany.url,
        linkText: `Visit ${parentCompany.name}`,
        tone: 'paper',
      }),

      sec('parentCompany', {
        eyebrow: dynamikBrand.role,
        index: '03',
        logo: dynamikBrand.logo,
        logoSurface: 'paper',
        name: dynamikBrand.name,
        tagline: dynamikBrand.tagline,
        description: dynamikBrand.description,
        tone: 'paper-2',
      }),

      sec('cta', {
        ...defaultCta,
        heading: 'Looking for our credentials?',
        text: 'Trade licence, VAT registration and manufacturer authorisations are available on request.',
      }),
    ],
  },

  /* ---- Media Centre ------------------------------------------------------- */
  {
    slug: 'media',
    title: 'Media Centre',
    seoTitle: 'Media Centre',
    seoDescription:
      'News, photo gallery and video gallery from Proactive Trade International — installations, press rooms and industry updates.',
    sections: [
      sec('pageHero', {
        eyebrow: 'Media Centre',
        title: 'What we are building, printing and commissioning.',
        lede: 'Company news, photography from installations and press rooms, and video walkthroughs of the workflows we supply.',
        compact: false,
        crumbs: [HOME, { label: 'Media Centre' }],
      }),

      sec('mediaHub', {
        entries: [
          {
            title: 'News',
            href: '/media/news',
            description:
              'Installations, partnerships and company updates from across our operation.',
            // Left blank on purpose: falls back to the newest article's cover.
            image: '',
            countFrom: 'news',
            unit: 'articles',
          },
          {
            title: 'Photo Gallery',
            href: '/media/photo-gallery',
            description:
              'Machinery installations, press rooms, warehousing and the teams behind them.',
            image: '',
            countFrom: 'gallery',
            unit: 'photographs',
          },
          {
            title: 'Video Gallery',
            href: '/media/video-gallery',
            description:
              'Workflow walkthroughs, machinery in production and technical explainers.',
            image: '/images/gallery/gallery-05.png',
            countFrom: 'videos',
            unit: 'videos',
          },
        ],
        tone: 'paper-2',
        cropMarks: true,
      }),

      sec('cta', defaultCta),
    ],
  },

  /* ---- Career -------------------------------------------------------------- */
  {
    slug: 'career',
    title: 'Career',
    seoTitle: 'Career',
    seoDescription:
      'Join Proactive Trade International — field service engineers, technical sales and CRM roles in printing and packaging supply across Bangladesh.',
    sections: [
      sec('pageHero', {
        eyebrow: 'Career',
        title: 'Work where the machines actually run.',
        lede: 'We hire engineers and technical staff who would rather solve a press room problem than send an email about it.',
        image: '/images/about/career.png',
        compact: false,
        crumbs: [HOME, { label: 'Career' }],
      }),

      sec('careerOpenings', {
        eyebrow: 'Open positions',
        index: '01',
        title: 'Roles we are hiring for right now.',
        footnote:
          'Nothing matching your experience? Send an open application — we keep strong CVs on file and contact people when a role opens.',
        tone: 'paper-2',
        cropMarks: true,
      }),

      sec('careerForm', {
        eyebrow: 'Apply',
        index: '02',
        title: 'Send us your application.',
        lede: 'Tell us what you have worked on. Attach a CV. If it fits, you will hear from a person, not an autoresponder.',
        tone: 'paper',
      }),
    ],
  },

  /* ---- Contact ------------------------------------------------------------- */
  {
    slug: 'contact',
    title: 'Contact',
    seoTitle: 'Contact',
    seoDescription:
      'Contact Proactive Trade International — 292, Inner Circular Road, Shatabdi Centre, Fakirapool, Motijheel, Dhaka-1000. Phone +880 1855 939 450.',
    sections: [
      sec('pageHero', {
        eyebrow: 'Contact',
        title: 'Talk to the people who will service it.',
        lede: 'Sales, technical support and consumable reordering — one team, one number, one inbox.',
        compact: false,
        crumbs: [HOME, { label: 'Contact' }],
      }),

      sec('contactDetails', {
        eyebrow: 'Our office',
        index: '01',
        addressLabel: 'Address',
        phoneLabel: 'Phone',
        emailLabel: 'Email',
        hoursLabel: 'Office hours',
        hoursValue: 'Saturday – Thursday, 9:00 – 18:00',
        hoursNote:
          'Emergency service support outside these hours for contract customers.',
        followLabel: 'Follow',
        formEyebrow: 'Send a message',
        formIndex: '02',
        tone: 'paper-2',
        cropMarks: true,
      }),

      sec('map', {
        title: 'Proactive Trade International office location',
        height: 'lg',
      }),
    ],
  },
];

/** Guard: every fixed page slug must have seed data, and vice versa. */
export function assertPagesCovered() {
  const seeded = new Set(seedPages.map((p) => p.slug));
  const missing = PAGE_SLUGS.filter((s) => !seeded.has(s));
  if (missing.length > 0) {
    throw new Error(
      `Missing seed data for page(s): ${missing.map((s) => pageLabels[s]).join(', ')}`,
    );
  }
  if (seeded.size !== seedPages.length) {
    throw new Error('Duplicate page slug in seedPages.');
  }
}
