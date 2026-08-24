import { getCategories, getProducts } from '@/lib/data';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import RevealOnView from '@/components/motion/RevealOnView';
import InkStagger from '@/components/motion/InkStagger';
import RollerLine from '@/components/motion/RollerLine';
import { stripHtml } from '@/lib/utils';
import type { CategoryGridData } from '@/lib/sections/schemas';

/**
 * Product categories, read live from the categories collection — a category
 * added in the dashboard appears here without touching the section.
 *
 * Only the framing (heading, link, limit, layout variant) is section content.
 *
 *   cards4 — four across, portrait cards (home)
 *   cards2 — two across, wide cards with a product count (/products)
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

  const [all, products] = await Promise.all([
    getCategories(),
    showCount ? getProducts() : Promise.resolve([]),
  ]);

  const categories = limit > 0 ? all.slice(0, limit) : all;
  if (categories.length === 0) return null;

  const countFor = (slug: string) =>
    products.filter((p) => p.categorySlug === slug).length;

  const hasHeading = Boolean(eyebrow || title);
  const invert = tone === 'ink';

  const cardFor = (c: (typeof categories)[number], i: number) => {
    const count = showCount ? countFor(c.slug) : 0;
    return (
      <Card
        href={`/products/${c.slug}`}
        title={c.name}
        image={c.image}
        description={stripHtml(c.description, wide ? 150 : 110)}
        eyebrow={
          showCount
            ? `${String(i + 1).padStart(2, '0')} · ${count} ${count === 1 ? 'product' : 'products'}`
            : `0${i + 1}`
        }
        aspect={wide ? 'video' : 'portrait'}
        sizes={
          wide
            ? '(min-width: 640px) 45vw, 92vw'
            : '(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw'
        }
        className="h-full"
      />
    );
  };

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

      {rollerLine && <RollerLine className="mt-10" />}

      {wide ? (
        <InkStagger as="ul" className="grid gap-6 sm:grid-cols-2" stagger={0.1} y={34}>
          {categories.map((c, i) => (
            <li data-ink-item key={c.slug}>
              {cardFor(c, i)}
            </li>
          ))}
        </InkStagger>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <RevealOnView key={c.slug} delay={i * 60}>
              {cardFor(c, i)}
            </RevealOnView>
          ))}
        </div>
      )}
    </Section>
  );
}
