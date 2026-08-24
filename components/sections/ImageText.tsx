import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Section from '@/components/ui/Section';
import Eyebrow from '@/components/ui/Eyebrow';
import RichText from '@/components/ui/RichText';
import RevealOnView from '@/components/motion/RevealOnView';
import { cn } from '@/lib/utils';
import type { ImageTextData } from '@/lib/sections/schemas';

/**
 * Two-column image + copy block. Used for the home about teaser and the closing
 * band on Our Story — same coded layout, different content and tone.
 *
 * `side` and `imageAspect` are coded variants the editor picks from; there is
 * no way to author arbitrary layout here.
 */
export default function ImageText({
  eyebrow,
  index,
  heading,
  html,
  image,
  imageAlt,
  side,
  imageAspect,
  tone,
  cropMarks,
  halftone,
  ctaText,
  ctaHref,
  badgeValue,
  badgeLabel,
}: ImageTextData) {
  const invert = tone === 'ink';

  const copy = (
    <RevealOnView className={side === 'left' ? 'lg:order-2' : undefined}>
      {eyebrow && (
        <Eyebrow index={index} tone="magenta">
          {eyebrow}
        </Eyebrow>
      )}
      <h2
        className={cn(
          'text-xl font-bold leading-tight md:text-2xl',
          eyebrow && 'mt-5',
          invert && 'text-onband',
        )}
      >
        {heading}
      </h2>

      <RichText html={html} invert={invert} className="mt-5 max-w-xl" />

      {ctaText && (
        <Link
          href={ctaHref || '/'}
          className={cn(
            'group mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] transition-colors',
            invert ? 'text-onband hover:text-cyan' : 'text-ink hover:text-magenta',
          )}
        >
          {ctaText}
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
          />
        </Link>
      )}
    </RevealOnView>
  );

  const media = (
    <RevealOnView
      delay={80}
      className={cn('relative', side === 'left' && 'lg:order-1')}
    >
      <div
        className={cn(
          'relative overflow-hidden bg-band',
          imageAspect === '16/10' ? 'aspect-[16/10]' : 'aspect-[4/3]',
          invert && 'border border-line',
        )}
      >
        <Image
          src={image}
          alt={imageAlt ?? ''}
          fill
          sizes="(min-width: 1024px) 46vw, 92vw"
          loading="lazy"
          className="object-cover"
        />
      </div>

      {/* Registration stat plate overlapping the image edge. */}
      {badgeValue && (
        <div className="absolute -bottom-6 -left-4 hidden bg-band px-6 py-5 text-onband sm:block">
          <p className="font-display text-2xl font-bold leading-none">{badgeValue}</p>
          {badgeLabel && <p className="eyebrow mt-2 text-onband/50">{badgeLabel}</p>}
        </div>
      )}
    </RevealOnView>
  );

  return (
    <Section tone={tone} cropMarks={cropMarks} halftone={halftone}>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        {copy}
        {media}
      </div>
    </Section>
  );
}
