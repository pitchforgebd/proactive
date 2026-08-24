import { Download } from 'lucide-react';
import { getSiteSettings } from '@/lib/data';
import Section from '@/components/ui/Section';
import Eyebrow from '@/components/ui/Eyebrow';
import RichText from '@/components/ui/RichText';
import RevealOnView from '@/components/motion/RevealOnView';
import type { RichTextFactsAsideData } from '@/lib/sections/schemas';

/**
 * Long-form copy with a sticky fact sheet alongside it — the Company profile.
 *
 * The request-a-copy button composes a mailto: against the address in Settings
 * rather than storing an email in the section, so there is one place to change
 * the company inbox.
 */
export default async function RichTextFactsAside({
  eyebrow,
  index,
  html,
  tone,
  cropMarks,
  facts,
  boxEyebrow,
  boxText,
  boxCtaText,
  boxCtaMailSubject,
}: RichTextFactsAsideData) {
  const settings = await getSiteSettings();
  const mailto = `mailto:${settings.email}${
    boxCtaMailSubject ? `?subject=${encodeURIComponent(boxCtaMailSubject)}` : ''
  }`;

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
          <div className="lg:sticky lg:top-[110px]">
            {facts.length > 0 && (
              <dl className="grid grid-cols-2 gap-px overflow-hidden border border-ink/10 bg-ink/10">
                {facts.map((f) => (
                  <div key={f.label} className="bg-paper-2 p-5">
                    <dt className="eyebrow text-graphite">{f.label}</dt>
                    <dd className="mt-2.5 text-sm font-semibold text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {(boxEyebrow || boxText || boxCtaText) && (
              <div className="mt-6 border border-dashed border-ink/25 p-6">
                {boxEyebrow && <Eyebrow tone="cyan">{boxEyebrow}</Eyebrow>}
                {boxText && (
                  <p className="mt-4 text-sm leading-relaxed text-graphite">{boxText}</p>
                )}
                {boxCtaText && (
                  <a
                    href={mailto}
                    className="mt-5 inline-flex items-center gap-2 rounded-sm border border-ink/25 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:border-magenta hover:text-magenta"
                  >
                    <Download aria-hidden="true" className="h-3.5 w-3.5" />
                    {boxCtaText}
                  </a>
                )}
              </div>
            )}
          </div>
        </RevealOnView>
      </div>
    </Section>
  );
}
