import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getNews } from '@/lib/data';
import PageHero from '@/components/layout/PageHero';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import Eyebrow from '@/components/ui/Eyebrow';
import RevealOnView from '@/components/motion/RevealOnView';
import CTABand from '@/components/ui/CTABand';
import { formatDate, isoDate } from '@/lib/utils';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'News',
  description:
    'Company news from Proactive Trade International — installations, warehousing, partnerships and technical support updates.',
  alternates: { canonical: '/media/news' },
};

export default async function NewsListPage() {
  const posts = await getNews();
  const [lead, ...rest] = posts;

  return (
    <>
      <PageHero
        eyebrow="Media Centre"
        title="News"
        lede="Installations, partnerships and operational updates from across our business."
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Media Centre', href: '/media' },
          { label: 'News' },
        ]}
      />

      {posts.length === 0 ? (
        <Section tone="paper-2">
          <div className="border border-dashed border-ink/20 p-10 text-center">
            <p className="eyebrow text-graphite">No articles yet</p>
            <p className="mx-auto mt-4 max-w-md text-base text-graphite">
              Company updates will be published here.
            </p>
          </div>
        </Section>
      ) : (
        <>
          {/* Lead story */}
          <Section tone="paper-2" cropMarks>
            <RevealOnView>
              <Link
                href={`/media/news/${lead.slug}`}
                className="group grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center"
              >
                <div className="relative aspect-[16/10] overflow-hidden border border-ink/10 bg-ink">
                  <Image
                    src={lead.coverImage}
                    alt={lead.title}
                    fill
                    priority
                    sizes="(min-width: 1024px) 55vw, 92vw"
                    className="object-cover transition-transform duration-500 ease-press group-hover:scale-[1.03]"
                  />
                </div>

                <div>
                  <Eyebrow tone="magenta">Latest</Eyebrow>
                  <time
                    dateTime={isoDate(lead.publishedAt)}
                    className="mt-4 block font-mono text-xs uppercase tracking-[0.16em] text-graphite"
                  >
                    {formatDate(lead.publishedAt)}
                  </time>
                  <h2 className="mt-4 text-xl font-bold leading-tight md:text-2xl">
                    {lead.title}
                  </h2>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-graphite">
                    {lead.excerpt}
                  </p>
                  <span className="mt-7 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors group-hover:text-magenta">
                    Read article
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </RevealOnView>
          </Section>

          {rest.length > 0 && (
            <Section tone="paper">
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post, i) => (
                  <RevealOnView as="li" key={post.slug} delay={i * 60}>
                    <Card
                      href={`/media/news/${post.slug}`}
                      title={post.title}
                      image={post.coverImage}
                      description={post.excerpt}
                      eyebrow={formatDate(post.publishedAt)}
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                      className="h-full"
                    />
                  </RevealOnView>
                ))}
              </ul>
            </Section>
          )}
        </>
      )}

      <CTABand />
    </>
  );
}
