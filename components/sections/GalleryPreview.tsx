import Image from 'next/image';
import Link from 'next/link';
import { getGalleryImages } from '@/lib/data';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import RevealOnView from '@/components/motion/RevealOnView';
import HalftoneBg from '@/components/motion/HalftoneBg';
import type { GalleryPreviewData } from '@/lib/sections/schemas';

/**
 * A strip of the photo gallery, read live from the gallery collection. Upload
 * an image in the dashboard and it appears here; only the framing is section
 * content.
 */
export default async function GalleryPreview({
  eyebrow,
  index,
  title,
  lede,
  linkText,
  linkHref,
  limit,
  tone,
  halftone,
}: GalleryPreviewData) {
  const gallery = await getGalleryImages(limit);
  if (gallery.length === 0) return null;

  const invert = tone === 'ink';
  const href = linkHref || '/media/photo-gallery';

  return (
    <Section tone={tone} className="overflow-hidden">
      {halftone && <HalftoneBg fade className="opacity-50" />}

      <SectionHeading
        eyebrow={eyebrow}
        index={index}
        title={title ?? ''}
        lede={lede}
        link={linkText ? { href, label: linkText } : undefined}
        invert={invert}
      />

      <ul className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {gallery.map((g, i) => (
          <RevealOnView as="li" key={g.id} delay={i * 40}>
            <Link
              href={href}
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
  );
}
