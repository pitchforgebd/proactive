import Image from 'next/image';
import Link from 'next/link';
import { getGalleryImages } from '@/lib/data';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import MotionReveal from '@/components/motion/MotionReveal';
import HalftoneBg from '@/components/motion/HalftoneBg';
import type { GalleryPreviewData } from '@/lib/sections/schemas';

/**
 * Gallery strip — staggered Framer reveals + stronger hover presence.
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
          <MotionReveal as="li" key={g.id} delay={i * 50}>
            <Link
              href={href}
              className="group relative block aspect-square overflow-hidden rounded-xl border border-line"
            >
              <Image
                src={g.src}
                alt={g.caption ?? 'Proactive Trade International gallery image'}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 30vw, 45vw"
                loading="lazy"
                className="object-cover transition-transform duration-700 ease-press group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-band/70 via-band/20 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-40" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-2 top-2 h-4 w-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cyan" />
                <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-magenta" />
              </span>
            </Link>
          </MotionReveal>
        ))}
      </ul>
    </Section>
  );
}
