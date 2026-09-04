import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
        <InkRule tone={invert ? 'ink' : 'paper'} className="mt-10" />
      )}

      {rollerLine && <RollerLine className="mt-10" />}

      <InkStagger as="ul" className="mt-8 grid gap-6 sm:grid-cols-2" stagger={0.1} y={34}>
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
        <InkRule tone={invert ? 'ink' : 'paper'} className="mt-10" />
      )}

      {rollerLine && <RollerLine className="mt-10" />}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {categories.map((c, i) => (
          <RevealOnView key={c.slug} delay={i * 50}>
            <Card
              href={`/products/${c.slug}`}
              title={c.name}
              image={c.image}
              description={stripHtml(c.description, 90)}
              eyebrow={`${String(i + 1).padStart(2, '0')}`}
              aspect="square"
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 45vw"
              className="h-full"
            />
          </RevealOnView>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
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
