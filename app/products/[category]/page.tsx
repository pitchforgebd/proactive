import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategories, getCategory, getProductsByCategory } from '@/lib/data';
import PageHero from '@/components/layout/PageHero';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import RichText from '@/components/ui/RichText';
import RevealOnView from '@/components/motion/RevealOnView';
import CTABand from '@/components/ui/CTABand';
import { absoluteUrl, stripHtml } from '@/lib/utils';

export const revalidate = 60;

/** Pre-render every known category; ISR fills in ones added later. */
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const category = await getCategory(params.category);
  if (!category) return { title: 'Category not found' };

  const description =
    category.seo?.description ?? stripHtml(category.description, 158);

  return {
    title: category.seo?.title ?? category.name,
    description,
    alternates: { canonical: `/products/${category.slug}` },
    openGraph: {
      title: category.seo?.title ?? category.name,
      description,
      url: absoluteUrl(`/products/${category.slug}`),
      images: [{ url: category.seo?.ogImage ?? category.image }],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = await getCategory(params.category);
  if (!category) notFound();

  const products = await getProductsByCategory(category.slug);

  return (
    <>
      <PageHero
        eyebrow="What We Offer"
        title={category.name}
        image={category.image}
        imageAlt=""
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'What We Offer', href: '/products' },
          { label: category.name },
        ]}
      />

      <Section tone="paper-2" cropMarks>
        <RevealOnView>
          <RichText html={category.description} className="max-w-3xl" />
        </RevealOnView>
      </Section>

      <Section tone="paper">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-xl font-bold md:text-2xl">Products in this line</h2>
          <span className="eyebrow shrink-0 text-graphite">
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {products.length > 0 ? (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <RevealOnView as="li" key={p.slug} delay={i * 60}>
                <Card
                  href={`/products/${category.slug}/${p.slug}`}
                  title={p.name}
                  image={p.images[0]}
                  description={p.summary}
                  eyebrow={String(i + 1).padStart(2, '0')}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                  className="h-full"
                />
              </RevealOnView>
            ))}
          </ul>
        ) : (
          /* Empty state in the interface's own voice — no apology. */
          <div className="mt-10 border border-dashed border-ink/20 p-10 text-center">
            <p className="eyebrow text-graphite">Nothing listed yet</p>
            <p className="mx-auto mt-4 max-w-md text-base text-graphite">
              This line is stocked but not yet catalogued online. Contact our team
              for the current range and availability.
            </p>
          </div>
        )}
      </Section>

      <CTABand
        title={`Specifying ${category.name.toLowerCase()}?`}
        lede="Send us your press, substrate and run profile — we will match the right products and confirm local stock."
      />
    </>
  );
}
