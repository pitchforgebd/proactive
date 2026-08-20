import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Section from '@/components/ui/Section';
import Eyebrow from '@/components/ui/Eyebrow';
import RevealOnView from '@/components/motion/RevealOnView';
import StepFeed from '@/components/motion/StepFeed';
import { capabilities } from '@/lib/data/mock/content';

/**
 * "Our Capabilities" — the service promise, not a product list.
 *
 * Two halves: the claim on paper, the method on ink. The dark panel carries the
 * four-step approach as a numbered ladder so the last line of the copy ("our
 * approach is simple…") is read as structure rather than as a sentence.
 */
export default function Capabilities() {
  return (
    <Section id="capabilities" tone="paper-2" cropMarks>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Claim ------------------------------------------------------------ */}
        <RevealOnView className="lg:col-span-6">
          <Eyebrow index="05" tone="magenta">
            Our Capabilities / Technical Support
          </Eyebrow>

          <h2 className="mt-5 text-xl font-bold leading-tight md:text-2xl">
            {capabilities.title
              .split('.')
              .map((phrase) => phrase.trim())
              .filter(Boolean)
              .map((phrase, i) => (
                <span key={phrase} className="block">
                  <span
                    aria-hidden="true"
                    className={
                      i === 1
                        ? 'mr-3 inline-block h-1.5 w-1.5 translate-y-[-0.35em] bg-magenta'
                        : 'mr-3 inline-block h-1.5 w-1.5 translate-y-[-0.35em] bg-cyan'
                    }
                  />
                  {phrase}.
                </span>
              ))}
          </h2>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-graphite">
            {capabilities.lede}
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-graphite">
            {capabilities.body}
          </p>

          {/* The support surface, scannable. */}
          <ul className="mt-8 flex flex-wrap gap-2">
            {capabilities.services.map((s) => (
              <li
                key={s}
                className="border border-ink/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-graphite"
              >
                {s}
              </li>
            ))}
          </ul>

          <Link
            href="/contact"
            className="group mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:text-magenta"
          >
            Talk to our technical team
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
            />
          </Link>
        </RevealOnView>

        {/* Method ----------------------------------------------------------- */}
        <RevealOnView delay={80} className="lg:col-span-6">
          <div className="relative flex h-full flex-col justify-center overflow-hidden bg-band p-8 text-onband md:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 halftone opacity-60"
            />

            <div className="relative">
              <Eyebrow tone="cyan">Our approach is simple</Eyebrow>

              <StepFeed className="relative mt-8">
                {/* Guide rail — draws down before the sheets feed in. */}
                <span
                  data-feed-rail
                  aria-hidden="true"
                  className="absolute left-[9px] top-2 h-[calc(100%-1rem)] w-px bg-cyan/25"
                />

                <ol>
                  {capabilities.approach.map((a, i) => (
                  <li
                    data-feed-item
                    key={a.step}
                    className="group relative flex gap-5 border-t border-line py-5 last:border-b"
                  >
                    <span className="mt-1 font-mono text-xs tracking-[0.16em] text-cyan/80">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1">
                      <span className="block font-display text-lg font-bold leading-tight text-onband">
                        {a.step}
                      </span>
                      <span className="mt-1 block text-sm text-onband/55">
                        {a.detail}
                      </span>
                    </span>
                    {/* Registration tick, right-aligned like a press mark. */}
                    <span
                      aria-hidden="true"
                      className="mt-2 h-px w-6 shrink-0 self-start bg-magenta/60"
                    />
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
