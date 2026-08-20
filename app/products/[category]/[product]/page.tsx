import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Mail, Phone } from 'lucide-react';
import {
  getAllProductPaths,
  getCategory,
  getProduct,
  getRelatedProducts,
  getSiteSettings,
} from '@/lib/data';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import RichText from '@/components/ui/RichText';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Eyebrow from '@/components/ui/Eyebrow';
import RevealOnView from '@/components/motion/RevealOnView';
import ProductGallery from '@/components/products/ProductGallery';
import CTABand from '@/components/ui/CTABand';
import { absoluteUrl } from '@/lib/utils';

export const revalidate = 60;

export async function generateStaticParams() {
  return getAllProductPaths();
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; product: string };
}): Promise<Metadata> {
  const product = await getProduct(params.category, params.product);
  if (!product) return { title: 'Product not found' };

  const description = product.seo?.description ?? product.summary;
  const path = `/products/${product.categorySlug}/${product.slug}`;

  return {
    title: product.seo?.title ?? product.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      title: product.seo?.title ?? product.name,
      description,
      url: absoluteUrl(path),
      images: [{ url: product.seo?.ogImage ?? product.images[0] }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { category: string; product: string };
}) {
  const product = await getProduct(params.category, params.product);
  if (!product) notFound();

  const [category, related, settings] = await Promise.all([
    getCategory(product.categorySlug),
    getRelatedProducts(product.categorySlug, product.slug, 3),
    getSiteSettings(),
  ]);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.summary,
    image: product.images.map((i) => absoluteUrl(i)),
    category: category?.name,
    brand: { '@type': 'Brand', name: 'Proactive Trade International' },
    ...(product.specs?.length
      ? {
          additionalProperty: product.specs.map((s) => ({
            '@type': 'PropertyValue',
            name: s.label,
            value: s.value,
          })),
        }
      : {}),
  };

  return (
    <>
      <Section tone="paper-2" className="pb-0 pt-8 md:pb-0 md:pt-10">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'What We Offer', href: '/products' },
            ...(category
              ? [{ label: category.name, href: `/products/${category.slug}` }]
              : []),
            { label: product.name },
          ]}
        />
      </Section>

      <Section tone="paper-2" className="pt-10 md:pt-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <ProductGallery images={product.images} name={product.name} />

          <div>
            {category && (
              <Eyebrow tone="magenta">{category.name}</Eyebrow>
            )}
            <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-[-0.025em] md:text-3xl">
              {product.name}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-graphite">
              {product.summary}
            </p>

            {product.specs && product.specs.length > 0 && (
              <div className="mt-9">
                <h2 className="eyebrow text-cyan">Specification</h2>
                <dl className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
                  {product.specs.map((s) => (
                    <div
                      key={s.label}
                      className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-3"
                    >
                      <dt className="font-mono text-xs uppercase tracking-[0.12em] text-graphite">
                        {s.label}
                      </dt>
                      <dd className="text-sm font-medium text-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-sm bg-ink px-7 py-3.5 font-mono text-xs uppercase tracking-[0.16em] text-paper transition-colors hover:bg-magenta"
              >
                Request a Quote
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
                />
              </Link>
              <a
                href={`tel:${settings.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 rounded-sm border border-ink/25 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:border-magenta hover:text-magenta"
              >
                <Phone aria-hidden="true" className="h-3.5 w-3.5" />
                {settings.phone}
              </a>
            </div>

            <a
              href={`mailto:${settings.email}?subject=${encodeURIComponent(`Enquiry: ${product.name}`)}`}
              className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-graphite transition-colors hover:text-cyan"
            >
              <Mail aria-hidden="true" className="h-3.5 w-3.5" />
              {settings.email}
            </a>
          </div>
        </div>
      </Section>

      <Section tone="paper">
        <RevealOnView>
          <RichText html={product.content} className="max-w-3xl" />
        </RevealOnView>
      </Section>

      {related.length > 0 && (
        <Section tone="ink" halftone>
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-xl font-bold text-onband md:text-2xl">
              Related products
            </h2>
            {category && (
              <Link
                href={`/products/${category.slug}`}
                className="eyebrow shrink-0 text-onband/60 transition-colors hover:text-cyan"
              >
                All in {category.name}
              </Link>
            )}
          </div>

          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <RevealOnView as="li" key={p.slug} delay={i * 60}>
                <Card
                  href={`/products/${p.categorySlug}/${p.slug}`}
                  title={p.name}
                  image={p.images[0]}
                  description={p.summary}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                  className="h-full"
                />
              </RevealOnView>
            ))}
          </ul>
        </Section>
      )}

      <CTABand />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
    </>
  );
}
