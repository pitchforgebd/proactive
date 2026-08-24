import type { Metadata } from 'next';
import { getVideos } from '@/lib/data';
import PageHero from '@/components/layout/PageHero';
import Section from '@/components/ui/Section';
import YouTubeFacade from '@/components/media/YouTubeFacade';
import RevealOnView from '@/components/motion/RevealOnView';
import CTABand from '@/components/ui/CTABand';
import { formatDate, isoDate } from '@/lib/utils';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Video Gallery',
  description:
    'Workflow walkthroughs, machinery in production and technical explainers from Proactive Trade International.',
  alternates: { canonical: '/media/video-gallery' },
};

export default async function VideoGalleryPage() {
  const videos = await getVideos();

  return (
    <>
      <PageHero
        eyebrow="Media Centre"
        title="Video Gallery"
        lede="Workflow walkthroughs, machinery in production and technical explainers."
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Media Centre', href: '/media' },
          { label: 'Video Gallery' },
        ]}
      />

      <Section tone="ink" halftone>
        {videos.length === 0 ? (
          <div className="border border-dashed border-line p-10 text-center">
            <p className="eyebrow text-onband/60">No videos yet</p>
            <p className="mx-auto mt-4 max-w-md text-base text-onband/60">
              Videos published to our YouTube channel will appear here.
            </p>
          </div>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v, i) => (
              <RevealOnView as="li" key={v.id} delay={i * 60}>
                {/* Facade only — the player iframe is created on click (§5.6). */}
                <YouTubeFacade youtubeId={v.youtubeId} title={v.title} />
                <h2 className="mt-4 text-base font-semibold leading-snug text-onband">
                  {v.title}
                </h2>
                {v.publishedAt && (
                  <time
                    dateTime={isoDate(v.publishedAt)}
                    className="eyebrow mt-2 block text-onband/40"
                  >
                    {formatDate(v.publishedAt)}
                  </time>
                )}
              </RevealOnView>
            ))}
          </ul>
        )}
      </Section>

      <CTABand />
    </>
  );
}
