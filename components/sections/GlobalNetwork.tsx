import Section from '@/components/ui/Section';
import Eyebrow from '@/components/ui/Eyebrow';
import RichText from '@/components/ui/RichText';
import RevealOnView from '@/components/motion/RevealOnView';
import PressCounter from '@/components/motion/PressCounter';
import WorldMap from '@/components/motion/WorldMap';
import { resolveIcon, sectionIcons } from '@/lib/sections/icons';
import type { GlobalNetworkData } from '@/lib/sections/schemas';

/**
 * "Strategic network" intro — copy + stat rail beside an animated sourcing
 * map. Same coded layout on Home and Global Sourcing; only the copy differs
 * per instance (an editor picks content, never layout — see registry.ts).
 */
export default function GlobalNetwork({
  eyebrow,
  heading,
  html,
  stats,
  mapIcon,
  mapHeading,
  mapText,
  tone,
}: GlobalNetworkData) {
  const lines = heading.split('\n').map((l) => l.trim()).filter(Boolean);
  const MapIcon = resolveIcon(mapIcon, sectionIcons.Globe2);

  return (
    <Section tone={tone}>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <RevealOnView>
          {eyebrow && <Eyebrow tone="cyan">{eyebrow}</Eyebrow>}

          <h2 className="mt-4 font-display text-xl font-extrabold leading-[1.08] sm:text-2xl md:text-3xl">
            {lines.map((line, i) => (
              <span key={i} className={i === lines.length - 1 ? 'block text-magenta' : 'block text-ink'}>
                {line}
              </span>
            ))}
          </h2>

          <span aria-hidden="true" className="mt-5 block h-1 w-14 bg-cyan" />

          <RichText html={html} className="mt-6 max-w-lg" />

          {stats.length > 0 && (
            <dl className="mt-8 flex flex-wrap gap-8">
              {stats.map((s) => (
                <div key={s.label} className="border-l-2 border-magenta pl-4">
                  <dd className="font-display text-2xl font-extrabold leading-none text-ink sm:text-3xl">
                    <PressCounter value={s.value} />
                  </dd>
                  <dt className="eyebrow mt-2 text-graphite">{s.label}</dt>
                </div>
              ))}
            </dl>
          )}
        </RevealOnView>

        <RevealOnView delay={80}>
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-paper-2 shadow-[0_24px_60px_-32px_rgba(14,17,22,0.35)]">
            <div className="relative p-4 sm:p-6">
              <WorldMap />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-paper-2 via-transparent to-transparent"
              />
            </div>

            <div className="border-t border-ink/10 px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
                  <MapIcon aria-hidden="true" className="h-5 w-5" />
                </span>
                <p className="font-display text-base font-bold sm:text-lg">{mapHeading}</p>
              </div>
              {mapText && (
                <p className="mt-3 text-sm leading-relaxed text-graphite">{mapText}</p>
              )}
            </div>
          </div>
        </RevealOnView>
      </div>
    </Section>
  );
}
