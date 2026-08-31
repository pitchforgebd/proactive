import Image from 'next/image';
import Section from '@/components/ui/Section';
import RichText from '@/components/ui/RichText';
import RevealOnView from '@/components/motion/RevealOnView';
import type { FounderMessageData } from '@/lib/sections/schemas';

/**
 * Founder & CEO message: portrait, pull-quote, the message itself, signature.
 * Everything including the pull-quote and the signature block is editable.
 */
export default function FounderMessage({
  image,
  imageAlt,
  name,
  role,
  quote,
  html,
  signatureMark,
  signatureName,
  signatureRole,
  tone,
  cropMarks,
}: FounderMessageData) {
  return (
    <Section tone={tone} cropMarks={cropMarks}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-16">
        {/* Portrait */}
        <RevealOnView>
          <figure className="lg:sticky lg:top-[110px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-band">
              <Image
                src={image}
                alt={imageAlt ?? `Portrait of ${name}`}
                fill
                priority
                sizes="(min-width: 1024px) 320px, 92vw"
                className="object-cover"
              />
              {/* Registration ticks — the print gesture, quietly repeated. */}
              <span aria-hidden="true" className="absolute left-4 top-4 h-5 w-px bg-cyan" />
              <span aria-hidden="true" className="absolute left-4 top-4 h-px w-5 bg-cyan" />
            </div>
            <figcaption className="mt-5">
              <p className="font-display text-lg font-bold leading-tight text-ink">
                {name}
              </p>
              {role && <p className="eyebrow mt-2 text-magenta">{role}</p>}
            </figcaption>
          </figure>
        </RevealOnView>

        {/* Message */}
        <RevealOnView delay={80}>
          {quote && (
            <blockquote className="border-l-2 border-cyan pl-6 font-display text-lg font-semibold leading-snug text-ink md:text-xl">
              {quote}
            </blockquote>
          )}

          <RichText html={html} className={quote ? 'mt-10' : undefined} />

          {(signatureMark || signatureName) && (
            <div className="mt-12 border-t border-ink/10 pt-8">
              {signatureMark && (
                <p
                  aria-hidden="true"
                  className="font-display text-xl italic text-ink/80"
                  style={{ transform: 'skewX(-8deg)' }}
                >
                  {signatureMark}
                </p>
              )}
              {signatureName && (
                <p className="mt-4 text-sm font-semibold text-ink">{signatureName}</p>
              )}
              {signatureRole && (
                <p className="eyebrow mt-1.5 text-graphite">{signatureRole}</p>
              )}
            </div>
          )}
        </RevealOnView>
      </div>
    </Section>
  );
}
