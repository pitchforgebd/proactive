import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { getSiteSettings } from '@/lib/data';
import Section from '@/components/ui/Section';
import Eyebrow from '@/components/ui/Eyebrow';
import RevealOnView from '@/components/motion/RevealOnView';
import { LazyContactForm } from '@/components/forms/LazyForms';
import type { ContactDetailsData } from '@/lib/sections/schemas';

/**
 * Contact block: office details beside the message form.
 *
 * Address, phone, email and the social links come from Settings — one edit in
 * the dashboard updates this page, the header and the footer together. The
 * labels and office hours are section content.
 */
export default async function ContactDetails({
  eyebrow,
  index,
  addressLabel,
  phoneLabel,
  emailLabel,
  hoursLabel,
  hoursValue,
  hoursNote,
  followLabel,
  formEyebrow,
  formIndex,
  tone,
  cropMarks,
}: ContactDetailsData) {
  const settings = await getSiteSettings();

  return (
    <Section tone={tone} cropMarks={cropMarks}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        {/* Contact details */}
        <RevealOnView>
          {eyebrow && (
            <Eyebrow index={index} tone="magenta">
              {eyebrow}
            </Eyebrow>
          )}

          <ul className="mt-8 space-y-7">
            <li className="flex gap-4">
              <MapPin aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-cyan" />
              <div>
                <p className="eyebrow text-graphite">{addressLabel}</p>
                <address className="mt-2 not-italic text-base leading-relaxed text-ink">
                  {settings.address}
                </address>
              </div>
            </li>

            <li className="flex gap-4">
              <Phone aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-cyan" />
              <div>
                <p className="eyebrow text-graphite">{phoneLabel}</p>
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
                <p className="eyebrow text-graphite">{emailLabel}</p>
                <a
                  href={'mailto:' + settings.email}
                  className="mt-2 block text-base text-ink transition-colors hover:text-magenta"
                >
                  {settings.email}
                </a>
              </div>
            </li>

            {hoursValue && (
              <li className="flex gap-4">
                <Clock aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-cyan" />
                <div>
                  <p className="eyebrow text-graphite">{hoursLabel}</p>
                  <p className="mt-2 text-base text-ink">{hoursValue}</p>
                  {hoursNote && (
                    <p className="mt-1 text-sm text-graphite">{hoursNote}</p>
                  )}
                </div>
              </li>
            )}
          </ul>

          {settings.socials.length > 0 && (
            <div className="mt-9">
              <p className="eyebrow text-graphite">{followLabel}</p>
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
          )}
        </RevealOnView>

        {/* Form */}
        <RevealOnView delay={80}>
          <Eyebrow index={formIndex} tone="cyan">
            {formEyebrow}
          </Eyebrow>
          <div className="mt-8">
            <LazyContactForm />
          </div>
        </RevealOnView>
      </div>
    </Section>
  );
}
