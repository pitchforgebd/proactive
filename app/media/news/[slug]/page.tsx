import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getNews, getNewsPost } from '@/lib/data';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import RichText from '@/components/ui/RichText';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import RevealOnView from '@/components/motion/RevealOnView';
import CTABand from '@/components/ui/CTABand';
import { absoluteUrl, formatDate, isoDate } from '@/lib/utils';

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getNews();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getNewsPost(params.slug);
  if (!post) return { title: 'Article not found' };

  const description = post.seo?.description ?? post.excerpt;

  return {
    title: post.seo?.title ?? post.title,
    description,
    alternates: { canonical: `/media/news/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.seo?.title ?? post.title,
      description,
      url: absoluteUrl(`/media/news/${post.slug}`),
      publishedTime: post.publishedAt,
      images: [{ url: post.seo?.ogImage ?? post.coverImage }],
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getNewsPost(params.slug);
  if (!post) notFound();

  const more = (await getNews()).filter((p) => p.slug !== post.slug).slice(0, 3);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.excerpt,
    image: [absoluteUrl(post.coverImage)],
    datePublished: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Proactive Trade International',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Proactive Trade International',
      logo: { '@type': 'ImageObject', url: absoluteUrl('/images/og/og-default.png') },
    },
    mainEntityOfPage: absoluteUrl(`/media/news/${post.slug}`),
  };

  return (
    <>
      <article>
        <Section tone="paper-2" className="pb-0 pt-8 md:pb-0 md:pt-10">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Media Centre', href: '/media' },
              { label: 'News', href: '/media/news' },
              { label: post.title },
            ]}
          />
        </Section>

        <Section tone="paper-2" className="pt-8 md:pt-10">
          <header className="max-w-3xl">
            <time
              dateTime={isoDate(post.publishedAt)}
              className="eyebrow block text-magenta"
            >
              {formatDate(post.publishedAt)}
            </time>
            <h1 className="mt-5 text-2xl font-extrabold leading-tight tracking-[-0.025em] md:text-3xl">
              {post.title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-graphite">
              {post.excerpt}
            </p>
          </header>

          <figure className="relative mt-10 aspect-[16/9] overflow-hidden border border-ink/10 bg-ink">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              sizes="(min-width: 1280px) 80vw, 92vw"
              className="object-cover"
            />
          </figure>

          <RevealOnView className="mt-12">
            <RichText html={post.content} />
          </RevealOnView>
        </Section>
      </article>

      {more.length > 0 && (
        <Section tone="paper">
          <h2 className="text-xl font-bold md:text-2xl">More from the newsroom</h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p, i) => (
              <RevealOnView as="li" key={p.slug} delay={i * 60}>
                <Card
                  href={`/media/news/${p.slug}`}
                  title={p.title}
                  image={p.coverImage}
                  description={p.excerpt}
                  eyebrow={formatDate(p.publishedAt)}
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    </>
  );
}
