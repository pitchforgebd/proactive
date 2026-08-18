import type { Metadata } from 'next';
import { Download } from 'lucide-react';
import { companyProfile } from '@/lib/data/mock/content';
import { getSiteSettings } from '@/lib/data';
import PageHero from '@/components/layout/PageHero';
import Section from '@/components/ui/Section';
import RichText from '@/components/ui/RichText';
import Eyebrow from '@/components/ui/Eyebrow';
import RevealOnView from '@/components/motion/RevealOnView';
import CTABand from '@/components/ui/CTABand';

export const metadata: Metadata = {
  title: 'Company',
  description: companyProfile.intro,
  alternates: { canonical: '/company' },
};

export default async function CompanyPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero
        eyebrow="Company"
        title="Company profile."
        lede={companyProfile.intro}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Company' }]}
        image="/images/about/company-profile.png"
      />

      <Section tone="paper-2" cropMarks>
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <RevealOnView>
            <Eyebrow index="01" tone="magenta">
              Overview
            </Eyebrow>
            <RichText html={companyProfile.body} className="mt-6" />
          </RevealOnView>

          <RevealOnView delay={80}>
            <div className="lg:sticky lg:top-[110px]">
              {/* Fact sheet */}
              <dl className="grid grid-cols-2 gap-px overflow-hidden border border-ink/10 bg-ink/10">
                {companyProfile.facts.map((f) => (
                  <div key={f.label} className="bg-paper-2 p-5">
                    <dt className="eyebrow text-graphite">{f.label}</dt>
                    <dd className="mt-2.5 text-sm font-semibold text-ink">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Company profile download — placeholder until the PDF is supplied. */}
              <div className="mt-6 border border-dashed border-ink/25 p-6">
                <Eyebrow tone="cyan">Company profile</Eyebrow>
                <p className="mt-4 text-sm leading-relaxed text-graphite">
                  A downloadable PDF profile is being prepared. Request a copy and
                  we will send it directly.
                </p>
                <a
                  href={`mailto:${settings.email}?subject=${encodeURIComponent('Request: Company profile PDF')}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-sm border border-ink/25 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:border-magenta hover:text-magenta"
                >
                  <Download aria-hidden="true" className="h-3.5 w-3.5" />
                  Request profile
                </a>
              </div>
            </div>
          </RevealOnView>
        </div>
      </Section>

      <CTABand
        title="Looking for our credentials?"
        lede="Trade licence, VAT registration and manufacturer authorisations are available on request."
      />
    </>
  );
}
