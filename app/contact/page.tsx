import type { Metadata } from 'next';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { getSiteSettings } from '@/lib/data';
import PageHero from '@/components/layout/PageHero';
import Section from '@/components/ui/Section';
import Eyebrow from '@/components/ui/Eyebrow';
import RevealOnView from '@/components/motion/RevealOnView';
import ContactForm from '@/components/forms/ContactForm';
import MapEmbed from '@/components/media/MapEmbed';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Proactive Trade International — 292, Inner Circular Road, Shatabdi Centre, Fakirapool, Motijheel, Dhaka-1000. Phone +880 1855 939 450.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the people who will service it."
        lede="Sales, technical support and consumable reordering — one team, one number, one inbox."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <Section tone="paper-2" cropMarks>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          {/* Contact details */}
          <RevealOnView>
            <Eyebrow index="01" tone="magenta">
              Our office
            </Eyebrow>

            <ul className="mt-8 space-y-7">
              <li className="flex gap-4">
                <MapPin aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-cyan" />
                <div>
                  <p className="eyebrow text-graphite">Address</p>
                  <address className="mt-2 not-italic text-base leading-relaxed text-ink">
                    {settings.address}
                  </address>
                </div>
              </li>

              <li className="flex gap-4">
                <Phone aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-cyan" />
                <div>
                  <p className="eyebrow text-graphite">Phone</p>
                  <a
                    href={'tel:' + settings.phone.replace(/\s/g, '')}
                    className="mt-2 block text-base text-ink transition-colors hover:text-magenta"
                  >
                    {settings.phone}
                  </a>
                </div>
              </li>

              <li className="flex gap-4">
                <Mail aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-cyan" />
                <div>
                  <p className="eyebrow text-graphite">Email</p>
                  <a
                    href={'mailto:' + settings.email}
                    className="mt-2 block text-base text-ink transition-colors hover:text-magenta"
                  >
                    {settings.email}
                  </a>
                </div>
              </li>

              <li className="flex gap-4">
                <Clock aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-cyan" />
                <div>
                  <p className="eyebrow text-graphite">Office hours</p>
                  <p className="mt-2 text-base text-ink">
                    Saturday – Thursday, 9:00 – 18:00
                  </p>
                  <p className="mt-1 text-sm text-graphite">
                    Emergency service support outside these hours for contract
                    customers.
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-9">
              <p className="eyebrow text-graphite">Follow</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {settings.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-sm border border-ink/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-graphite transition-colors hover:border-magenta hover:text-magenta"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnView>

          {/* Form */}
          <RevealOnView delay={80}>
            <Eyebrow index="02" tone="cyan">
              Send a message
            </Eyebrow>
            <div className="mt-8">
              <ContactForm />
            </div>
          </RevealOnView>
        </div>
      </Section>

      {/* Map — lazy, loads as it scrolls into range (§5.7). */}
      <Section tone="paper" className="py-0 md:py-0" containerClassName="px-0 md:px-0">
        <MapEmbed
          query={settings.mapQuery}
          title="Proactive Trade International office location"
          heightClass="h-[420px]"
          className="border-x-0"
        />
      </Section>
    </>
  );
}
