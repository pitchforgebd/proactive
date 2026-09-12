import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import RevealOnView from '@/components/motion/RevealOnView';
import { countryFlagEmoji } from '@/lib/utils';
import type { CountriesGridData } from '@/lib/sections/schemas';

/**
 * "Countries We Source From" — a coded card grid. `countries` is authored
 * data (like valueGrid's `items`), not a live collection: the flag is derived
 * from the stored ISO code rather than stored itself, so it can never drift.
 */
export default function CountriesGrid({
  eyebrow,
  index,
  title,
  lede,
  countries,
  tone,
}: CountriesGridData) {
  const invert = tone === 'ink';

  return (
    <Section tone={tone} halftone={false}>
      <SectionHeading
        eyebrow={eyebrow}
        index={index}
        title={title}
        lede={lede}
        invert={invert}
        align="center"
      />

      <ul className="mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {countries.map((c, i) => (
          <RevealOnView key={c.code} as="li" delay={Math.min(i * 40, 200)}>
            <div
              className={
                invert
                  ? 'flex h-full gap-4 rounded-xl border border-line bg-band-2/60 p-5'
                  : 'flex h-full gap-4 rounded-xl border border-ink/10 bg-paper-2 p-5 shadow-[0_1px_0_rgba(14,17,22,0.04)]'
              }
            >
              <span aria-hidden="true" className="text-3xl leading-none">
                {countryFlagEmoji(c.code)}
              </span>
              <div>
                <p className={invert ? 'font-display font-bold text-onband' : 'font-display font-bold text-ink'}>
                  {c.name}
                </p>
                {c.text && (
                  <p
                    className={
                      invert
                        ? 'mt-1.5 text-sm leading-relaxed text-onband/60'
                        : 'mt-1.5 text-sm leading-relaxed text-graphite'
                    }
                  >
                    {c.text}
                  </p>
                )}
              </div>
            </div>
          </RevealOnView>
        ))}
      </ul>
    </Section>
  );
}
