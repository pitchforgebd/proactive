import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Cpu,
  Globe2,
  Handshake,
  Headset,
  PackageCheck,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';
import { getCategories, getGalleryImages, getPartners } from '@/lib/data';
import {
  aboutIntro,
  coreValues,
  mission,
  vision,
  whyChooseUs,
} from '@/lib/data/mock/content';
import Hero from '@/components/home/Hero';
import Solutions from '@/components/home/Solutions';
import Capabilities from '@/components/home/Capabilities';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import Eyebrow from '@/components/ui/Eyebrow';
import CTABand from '@/components/ui/CTABand';
import RevealOnView from '@/components/motion/RevealOnView';
import RollerLine from '@/components/motion/RollerLine';
import HalftoneBg from '@/components/motion/HalftoneBg';
import PartnerMarquee from '@/components/media/PartnerMarquee';
import { stripHtml } from '@/lib/utils';

/** ISR — picks up dashboard content without a rebuild (Mode A). */
export const revalidate = 60;

const whyIcons = { Globe2, Wrench, PackageCheck, Headset };
const valueIcons = { Cpu, Users, ShieldCheck, BadgeCheck, Handshake };

export default async function HomePage() {
  const [categories, gallery, partners] = await Promise.all([
    getCategories(),
    getGalleryImages(6),
    getPartners(),
  ]);

  return (
    <>
      <Hero />

      {/* 2 — About teaser -------------------------------------------------- */}
      <Section tone="paper-2" cropMarks>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <RevealOnView>
            <Eyebrow index="01" tone="magenta">
              About Proactive Trade International
            </Eyebrow>
            <h2 className="mt-5 text-xl font-bold leading-tight md:text-2xl">
              A supplier that is measured on your uptime, not on its catalogue.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-graphite">
              {aboutIntro}
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-graphite">
              We deliver end-to-end performance solutions — world-class machineries,
              consumables held in our own warehouses, and dedicated Technical
              Support and CRM teams behind every installation.
            </p>
            <Link
              href="/about"
              className="group mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:text-magenta"
            >
              View More
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
              />
            </Link>
          </RevealOnView>

          <RevealOnView delay={80} className="relative">
            <div className="relative aspect-[4/3] overflow-hidden bg-band">
              <Image
                src="/images/about/about-company.png"
                alt="Proactive Trade International supplying printing and packaging production"
                fill
                sizes="(min-width: 1024px) 46vw, 92vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
            {/* Registration stat plate overlapping the image edge. */}
            <div className="absolute -bottom-6 -left-4 hidden bg-band px-6 py-5 text-onband sm:block">
              <p className="font-display text-2xl font-bold leading-none">100+</p>
              <p className="eyebrow mt-2 text-onband/50">Companies served</p>
            </div>
          </RevealOnView>
        </div>
      </Section>

      {/* 3 — Our Solutions -------------------------------------------------- */}
      <Solutions />

      {/* 4 — Featured categories ------------------------------------------- */}
      <Section tone="paper">
        <SectionHeading
          eyebrow="What We Offer"
          index="03"
          title="Four solution lines, one point of accountability."
          lede="Machineries, press room chemicals, inks and coatings, and the consumables that decide print quality on the sheet."
          link={{ href: '/products', label: 'View More' }}
        />

        <RollerLine className="mt-10" />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <RevealOnView key={c.slug} delay={i * 60}>
              <Card
                href={`/products/${c.slug}`}
                title={c.name}
                image={c.image}
                description={stripHtml(c.description, 110)}
                eyebrow={`0${i + 1}`}
                aspect="portrait"
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                className="h-full"
              />
            </RevealOnView>
          ))}
        </div>
      </Section>

      {/* 5 — Why choose us -------------------------------------------------- */}
      <Section tone="ink" halftone>
        <SectionHeading
          eyebrow="Why Choose Us"
          index="04"
          title="Anyone can quote a machine. Fewer can keep it running."
          invert
        />

        <ul className="mt-12 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseUs.map((item, i) => {
            const Icon = whyIcons[item.icon];
            return (
              <RevealOnView
                as="li"
                key={item.title}
                delay={i * 60}
                className="bg-band p-7"
              >
                <Icon aria-hidden="true" className="h-6 w-6 text-cyan" />
                <h3 className="mt-6 text-base font-semibold text-onband">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-onband/55">
                  {item.description}
                </p>
              </RevealOnView>
            );
          })}
        </ul>
      </Section>

      {/* 6 — Our Capabilities ----------------------------------------------- */}
      <Capabilities />

      {/* 7 — Vision & Mission strip ----------------------------------------- */}
      <Section tone="paper">
        <div className="grid gap-px overflow-hidden border border-ink/10 bg-ink/10 md:grid-cols-2">
          <RevealOnView className="bg-paper-2 p-8 md:p-12">
            <Eyebrow tone="cyan">Vision</Eyebrow>
            <p className="mt-6 text-lg leading-relaxed text-ink">{vision}</p>
          </RevealOnView>
          <RevealOnView delay={80} className="bg-paper-2 p-8 md:p-12">
            <Eyebrow tone="magenta">Mission</Eyebrow>
            <p className="mt-6 text-lg leading-relaxed text-ink">{mission}</p>
          </RevealOnView>
        </div>

        <div className="mt-8">
          <Link
            href="/vision-mission"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-graphite transition-colors hover:text-magenta"
          >
            Vision &amp; Mission in full
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
            />
          </Link>
        </div>
      </Section>

      {/* 8 — Core values ---------------------------------------------------- */}
      <Section tone="paper-2">
        <SectionHeading
          eyebrow="Core Values"
          index="06"
          title="Five commitments we are willing to be held to."
        />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {coreValues.map((v, i) => {
            const Icon = valueIcons[v.icon];
            return (
              <RevealOnView
                as="li"
                key={v.title}
                delay={i * 50}
                className="border-t-2 border-ink pt-6"
              >
                <Icon
                  aria-hidden="true"
                  className={i % 2 === 0 ? 'h-5 w-5 text-cyan' : 'h-5 w-5 text-magenta'}
                />
                <h3 className="mt-5 text-base font-semibold leading-snug">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite">
                  {v.description}
                </p>
              </RevealOnView>
            );
          })}
        </ul>
      </Section>

      {/* 9 — Gallery preview ------------------------------------------------ */}
      <Section tone="ink" className="overflow-hidden">
        <HalftoneBg fade className="opacity-50" />
        <SectionHeading
          eyebrow="Photo Gallery"
          index="07"
          title="Installations, press rooms and the people behind them."
          link={{ href: '/media/photo-gallery', label: 'View Gallery' }}
          invert
        />

        <ul className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {gallery.map((g, i) => (
            <RevealOnView as="li" key={g.id} delay={i * 40}>
              <Link
                href="/media/photo-gallery"
                className="group relative block aspect-square overflow-hidden border border-line"
              >
                <Image
                  src={g.src}
                  alt={g.caption ?? 'Proactive Trade International gallery image'}
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 768px) 30vw, 45vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-500 ease-press group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-band/30 transition-opacity duration-300 group-hover:opacity-0" />
              </Link>
            </RevealOnView>
          ))}
        </ul>
      </Section>

      {/* 10 — Partners ------------------------------------------------------ */}
      <Section tone="paper-2" className="py-14 md:py-16">
        <p className="eyebrow text-center text-graphite">
          Sourcing partners &amp; manufacturers
        </p>
        <div className="mt-10">
          <PartnerMarquee partners={partners} />
        </div>
      </Section>

      {/* 11 — Contact band -------------------------------------------------- */}
      <CTABand />
    </>
  );
}
