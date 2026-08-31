import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import Section from '@/components/ui/Section';
import Eyebrow from '@/components/ui/Eyebrow';
import RevealOnView from '@/components/motion/RevealOnView';
import type { ParentCompanyData } from '@/lib/sections/schemas';

/** Parent / group / brand block: logo plate, relationship copy, optional outbound link. */
export default function ParentCompany({
  eyebrow,
  index,
  logo,
  logoSurface = 'band',
  name,
  tagline,
  description,
  url,
  linkText,
  tone,
}: ParentCompanyData) {
  const plate =
    logoSurface === 'paper'
      ? 'relative flex h-[120px] w-[280px] items-center justify-center rounded-lg border border-ink/10 bg-paper-2 p-6'
      : 'relative flex h-[120px] w-[280px] items-center justify-center rounded-lg bg-band p-6';

  return (
    <Section tone={tone}>
      <div className="grid items-center gap-10 rounded-xl border border-ink/10 bg-paper-2 p-8 md:p-12 lg:grid-cols-[auto_1fr] lg:gap-16">
        <RevealOnView>
          <div className={plate}>
            <Image
              src={logo}
              alt={`${name} logo`}
              width={480}
              height={160}
              sizes="280px"
              loading="lazy"
              className="h-auto w-full object-contain"
            />
          </div>
        </RevealOnView>

        <RevealOnView delay={80}>
          {eyebrow && (
            <Eyebrow index={index} tone="cyan">
              {eyebrow}
            </Eyebrow>
          )}
          <h2 className="mt-5 text-xl font-bold leading-tight md:text-2xl">{name}</h2>
          {tagline && (
            <p className="mt-3 max-w-2xl font-display text-base font-semibold leading-snug text-ink md:text-lg">
              {tagline}
            </p>
          )}
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-graphite">
            {description}
          </p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-7 inline-flex items-center gap-2 font-mono text-xs uppercase text-ink transition-colors hover:text-magenta"
            >
              {linkText || `Visit ${name}`}
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 ease-press group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          )}
        </RevealOnView>
      </div>
    </Section>
  );
}
