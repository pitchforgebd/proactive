import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Section from '@/components/ui/Section';
import Eyebrow from '@/components/ui/Eyebrow';
import RichText from '@/components/ui/RichText';
import RevealOnView from '@/components/motion/RevealOnView';
import type { RichTextProfileAsideData } from '@/lib/sections/schemas';

/**
 * Long-form copy with a sticky profile card alongside it — the About page body
 * next to the founder card. Both halves are editable content.
 */
export default function RichTextProfileAside({
  eyebrow,
  index,
  html,
  tone,
  cropMarks,
  asideImage,
  asideImageAlt,
  asideEyebrow,
  asideName,
  asideText,
  asideCtaText,
  asideCtaHref,
}: RichTextProfileAsideData) {
  return (
    <Section tone={tone} cropMarks={cropMarks}>
      <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <RevealOnView>
          {eyebrow && (
            <Eyebrow index={index} tone="magenta">
              {eyebrow}
            </Eyebrow>
          )}
          <RichText html={html} invert={tone === 'ink'} className="mt-6" />
        </RevealOnView>

        <RevealOnView delay={80}>
          <aside className="rounded-xl border border-ink/10 bg-paper-2 p-7 lg:sticky lg:top-[110px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-band">
              <Image
                src={asideImage}
                alt={asideImageAlt ?? asideName}
                fill
                sizes="(min-width: 1024px) 32vw, 92vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
            {asideEyebrow && <p className="eyebrow mt-6 text-cyan">{asideEyebrow}</p>}
            <p className="mt-3 font-display text-lg font-bold leading-tight text-ink">
              {asideName}
            </p>
            {asideText && (
              <p className="mt-4 text-sm leading-relaxed text-graphite">{asideText}</p>
            )}
            {asideCtaText && (
              <Link
                href={asideCtaHref || '/about/leadership-message'}
                className="group mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase text-ink transition-colors hover:text-magenta"
              >
                {asideCtaText}
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
                />
              </Link>
            )}
          </aside>
        </RevealOnView>
      </div>
    </Section>
  );
}
