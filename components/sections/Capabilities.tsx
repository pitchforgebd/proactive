import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Section from '@/components/ui/Section';
import Eyebrow from '@/components/ui/Eyebrow';
import RevealOnView from '@/components/motion/RevealOnView';
import StepFeed from '@/components/motion/StepFeed';
import type { CapabilitiesData } from '@/lib/sections/schemas';

/**
 * "Our Capabilities" — the service promise, not a product list.
 *
 * Two halves: the claim on paper, the method on ink. The dark panel carries the
 * approach as a numbered ladder so the closing line of the copy is read as
 * structure rather than as a sentence.
 */
export default function Capabilities({
  eyebrow,
  index,
  title,
  lede,
  body,
  services,
  approachEyebrow,
  approach,
  ctaText,
  ctaHref,
}: CapabilitiesData) {
  // Each sentence of the title becomes its own line, with a navy bullet.
  const phrases = title
    .split('.')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Section id="capabilities" tone="paper-2" cropMarks>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Claim ------------------------------------------------------------ */}
        <RevealOnView className="lg:col-span-6">
          {eyebrow && (
            <Eyebrow index={index} tone="magenta">
              {eyebrow}
            </Eyebrow>
          )}

          <h2 className="mt-4 text-lg font-bold leading-snug sm:mt-5 sm:text-xl sm:leading-tight md:text-2xl">
            {phrases.map((phrase) => (
              <span key={phrase} className="block">
                <span
                  aria-hidden="true"
                  className="mr-3 inline-block h-1.5 w-1.5 translate-y-[-0.35em] bg-magenta"
                />
                {phrase}.
              </span>
            ))}
          </h2>

          {lede && (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-graphite">
              {lede}
            </p>
          )}
          {body && (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-graphite">
              {body}
            </p>
          )}

          {/* The support surface, scannable. */}
          {services.length > 0 && (
            <ul className="mt-9 flex flex-wrap gap-2.5">
              {services.map((s) => (
                <li
                  key={s}
                  className="rounded-lg border border-ink/15 px-3 py-1.5 font-mono text-[11px] uppercase text-graphite"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}

          {ctaText && (
            <Link
              href={ctaHref || '/contact'}
              className="group mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase text-ink transition-colors hover:text-magenta"
            >
              {ctaText}
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
              />
            </Link>
          )}
        </RevealOnView>

        {/* Method ----------------------------------------------------------- */}
        <RevealOnView delay={80} className="lg:col-span-6">
          <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-xl bg-band p-8 text-onband md:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 halftone opacity-60"
            />

            <div className="relative">
              <Eyebrow tone="cyan">{approachEyebrow}</Eyebrow>

              <StepFeed className="relative mt-9">
                {/* Feed path — draws down before the sheets travel along it. */}
                <span
                  data-feed-rail
                  aria-hidden="true"
                  className="absolute bottom-6 left-[19px] top-5 w-px -translate-x-1/2 bg-gradient-to-b from-cyan/60 via-cyan/25 to-transparent"
                />

                <ol>
                  {approach.map((a, i) => (
                    <li
                      data-feed-item
                      key={a.step}
                      className="group relative flex gap-5 pb-9 last:pb-0"
                    >
                      {/* Registration node sitting on the feed path. */}
                      <span
                        aria-hidden="true"
                        className="relative z-[1] flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-cyan/35 bg-band font-mono text-[11px] text-cyan transition-all duration-300 ease-press group-hover:border-cyan group-hover:bg-cyan group-hover:text-band group-hover:shadow-[0_0_0_4px_rgb(var(--cyan-rgb)/0.12)]"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <span className="flex-1 pt-1.5">
                        <span className="flex items-center gap-3">
                          <span className="font-display text-lg font-bold leading-tight text-onband">
                            {a.step}
                          </span>
                          {/* Press mark that runs out as the step is read. */}
                          <span
                            aria-hidden="true"
                            className="h-px w-0 bg-cyan/60 transition-[width] duration-500 ease-press group-hover:w-10"
                          />
                        </span>
                        <span className="mt-1.5 block text-sm leading-relaxed text-onband/55">
                          {a.detail}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </StepFeed>
            </div>
          </div>
        </RevealOnView>
      </div>
    </Section>
  );
}
