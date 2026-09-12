import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getCategories, getFeaturedCategories, getProducts } from '@/lib/data';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import RevealOnView from '@/components/motion/RevealOnView';
import InkStagger from '@/components/motion/InkStagger';
import RollerLine from '@/components/motion/RollerLine';
import InkRule from '@/components/motion/InkRule';
import { stripHtml } from '@/lib/utils';
import type { CategoryGridData } from '@/lib/sections/schemas';

/**
 * Column spans for the home "What We Offer" tiles, cycled by index: two wide /
 * narrow rows that mirror each other. Coded here, never authored by an editor.
 */
const FEATURED_SPANS = [
  'lg:col-span-7',
  'lg:col-span-5',
  'lg:col-span-5',
  'lg:col-span-7',
] as const;

/**
 * Product categories, depending on `variant`:
 *
 *   cards4 — home “What We Offer”: featured categories, square images,
 *            + “Explore all products” → /products
 *   cards2 — /products hub: every category with product counts
 */
export default async function CategoryGrid({
  eyebrow,
  index,
  title,
  lede,
  linkText,
  linkHref,
  limit,
  variant,
  showCount,
  rollerLine,
  tone,
  cropMarks,
}: CategoryGridData) {
  const wide = variant === 'cards2';
  const invert = tone === 'ink';
  const hasHeading = Boolean(eyebrow || title);

  if (!wide) {
    return (
      <FeaturedCategoriesGrid
        eyebrow={eyebrow}
        index={index}
        title={title}
        lede={lede}
        linkText={linkText}
        linkHref={linkHref}
        limit={limit > 0 ? limit : 8}
        rollerLine={rollerLine}
        tone={tone}
        cropMarks={cropMarks}
        hasHeading={hasHeading}
        invert={invert}
      />
    );
  }

  const [all, products] = await Promise.all([
    getCategories(),
    showCount ? getProducts() : Promise.resolve([]),
  ]);

  const categories = limit > 0 ? all.slice(0, limit) : all;
  if (categories.length === 0) return null;

  const countFor = (slug: string) =>
    products.filter((p) => p.categorySlug === slug).length;

  return (
    <Section tone={tone} cropMarks={cropMarks}>
      {hasHeading && (
        <SectionHeading
          eyebrow={eyebrow}
          index={index}
          title={title ?? ''}
          lede={lede}
          link={linkText ? { href: linkHref || '/products', label: linkText } : undefined}
          invert={invert}
        />
      )}

      {!rollerLine && hasHeading && (
        <InkRule tone={invert ? 'ink' : 'paper'} className="mt-12" />
      )}

      {rollerLine && <RollerLine className="mt-12" />}

      <InkStagger as="ul" className="mt-10 grid gap-6 sm:grid-cols-2" stagger={0.1} y={34}>
        {categories.map((c, i) => {
          const count = showCount ? countFor(c.slug) : 0;
          return (
            <li data-ink-item key={c.slug}>
              <Card
                href={`/products/${c.slug}`}
                title={c.name}
                image={c.image}
                description={stripHtml(c.description, 150)}
                eyebrow={
                  showCount
                    ? `${String(i + 1).padStart(2, '0')} · ${count} ${count === 1 ? 'product' : 'products'}`
                    : `0${i + 1}`
                }
                aspect="video"
                sizes="(min-width: 640px) 45vw, 92vw"
                className="h-full"
              />
            </li>
          );
        })}
      </InkStagger>
    </Section>
  );
}

async function FeaturedCategoriesGrid({
  eyebrow,
  index,
  title,
  lede,
  linkText,
  linkHref,
  limit,
  rollerLine,
  tone,
  cropMarks,
  hasHeading,
  invert,
}: {
  eyebrow?: string;
  index?: string;
  title?: string;
  lede?: string;
  linkText?: string;
  linkHref?: string;
  limit: number;
  rollerLine: boolean;
  tone: CategoryGridData['tone'];
  cropMarks: boolean;
  hasHeading: boolean;
  invert: boolean;
}) {
  let categories = await getFeaturedCategories(limit);
  // Before any category is marked Featured, keep the section useful.
  if (categories.length === 0) {
    categories = (await getCategories()).slice(0, limit);
  }
  if (categories.length === 0) return null;

  const exploreHref = linkHref || '/products';
  const exploreLabel = linkText || 'Explore all products';

  return (
    <Section tone={tone} cropMarks={cropMarks}>
      {hasHeading && (
        <SectionHeading
          eyebrow={eyebrow}
          index={index}
          title={title ?? ''}
          lede={lede}
          invert={invert}
        />
      )}

      {!rollerLine && hasHeading && (
        <InkRule tone={invert ? 'ink' : 'paper'} className="mt-12" />
      )}

      {rollerLine && <RollerLine className="mt-12" />}

      {/* Editorial tiles on a 12-column bed. The 7/5 · 5/7 rhythm repeats
          every four categories, so 4 or 8 of them both fill whole rows and an
          odd count still lands cleanly. Fixed heights (not aspect ratios) keep
          the rows aligned even though the spans differ. */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12">
        {categories.map((c, i) => (
          <RevealOnView
            key={c.slug}
            delay={i * 60}
            className={FEATURED_SPANS[i % FEATURED_SPANS.length]}
          >
            <Link
              href={`/products/${c.slug}`}
              className="group relative block h-[280px] overflow-hidden rounded-2xl sm:h-[300px] lg:h-[380px]"
            >
              <Image
                src={c.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                loading="lazy"
                className="object-cover transition-transform duration-700 ease-press group-hover:scale-[1.05]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-band via-band/60 to-band/5 transition-opacity duration-500 group-hover:opacity-95"
              />

              {/* Registration badge — arrives on hover, top-right like a mark. */}
              <span
                aria-hidden="true"
                className="absolute right-5 top-5 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full border border-onband/30 text-onband opacity-0 transition-all duration-300 ease-press group-hover:translate-y-0 group-hover:border-cyan group-hover:bg-cyan group-hover:text-band group-hover:opacity-100"
              >
                <ArrowUpRight className="h-4 w-4" />
              </span>

              <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                <span className="eyebrow text-cyan/80">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2.5 font-display text-lg font-bold leading-snug text-onband md:text-xl">
                  {c.name}
                </h3>
                <span
                  aria-hidden="true"
                  className="mt-3.5 block h-px w-8 bg-cyan transition-[width] duration-500 ease-press group-hover:w-20"
                />
                <p className="mt-3.5 max-w-md text-left text-sm leading-relaxed text-onband/60 line-clamp-2">
                  {stripHtml(c.description, 110)}
                </p>
              </div>
            </Link>
          </RevealOnView>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href={exploreHref}
          className="group inline-flex items-center gap-2 rounded-md bg-cyan px-7 py-3.5 font-mono text-xs uppercase text-band transition-colors hover:bg-magenta hover:text-white"
        >
          {exploreLabel}
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
          />
        </Link>
      </div>
    </Section>
  );
}
