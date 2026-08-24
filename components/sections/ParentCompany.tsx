import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import Section from '@/components/ui/Section';
import Eyebrow from '@/components/ui/Eyebrow';
import RevealOnView from '@/components/motion/RevealOnView';
import type { ParentCompanyData } from '@/lib/sections/schemas';

/** Parent / group company block: logo plate, relationship copy, outbound link. */
export default function ParentCompany({
  eyebrow,
  index,
  logo,
  name,
  description,
  url,
  linkText,
  tone,
}: ParentCompanyData) {
  return (
    <Section tone={tone}>
      <div className="grid items-center gap-10 border border-ink/10 bg-paper-2 p-8 md:p-12 lg:grid-cols-[auto_1fr] lg:gap-16">
        <RevealOnView>
          {/* Logo plate — ink ground so a mark of any colour sits cleanly. */}
          <div className="relative flex h-[120px] w-[280px] items-center justify-center bg-band p-6">
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
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-graphite">
            {description}
          </p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-7 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:text-magenta"
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
