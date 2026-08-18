import type { Metadata } from 'next';
import { getCategories, getProducts } from '@/lib/data';
import { whatWeOfferIntro } from '@/lib/data/mock/content';
import PageHero from '@/components/layout/PageHero';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import RichText from '@/components/ui/RichText';
import RevealOnView from '@/components/motion/RevealOnView';
import CTABand from '@/components/ui/CTABand';
import { stripHtml } from '@/lib/utils';

/** ISR — a category added in the dashboard appears without a rebuild. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'What We Offer — Printing & Packaging Solutions',
  description:
    'Machineries, press room chemicals, inks and coatings, blankets, plates, adhesives and papers — the full production chain for printing and packaging.',
  alternates: { canonical: '/products' },
};

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const countFor = (slug: string) =>
    products.filter((p) => p.categorySlug === slug).length;

  return (
    <>
      <PageHero
        eyebrow="What We Offer"
        title="Everything the press room runs on."
        lede="Four solution lines covering machineries, press room chemistry, inks and coatings, and the consumables that decide print quality on the sheet."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'What We Offer' }]}
      />

      <Section tone="paper-2" cropMarks>
        <RevealOnView>
          <RichText html={whatWeOfferIntro} className="max-w-3xl" />
        </RevealOnView>
      </Section>

      <Section tone="paper">
        <ul className="grid gap-6 sm:grid-cols-2">
          {categories.map((c, i) => {
            const count = countFor(c.slug);
            return (
              <RevealOnView as="li" key={c.slug} delay={i * 70}>
                <Card
                  href={`/products/${c.slug}`}
                  title={c.name}
                  image={c.image}
                  description={stripHtml(c.description, 150)}
                  eyebrow={`${String(i + 1).padStart(2, '0')} · ${count} ${count === 1 ? 'product' : 'products'}`}
                  aspect="video"
                  sizes="(min-width: 640px) 45vw, 92vw"
                  className="h-full"
                />
              </RevealOnView>
            );
          })}
        </ul>
      </Section>

      <CTABand
        title="Not sure which line you need? Describe the job."
        lede="Tell us the substrate, run length and finish you are aiming for — we will specify the machinery and consumables around it."
      />
    </>
  );
}
