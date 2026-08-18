import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { getCategories, getSiteSettings } from '@/lib/data';
import { footerLinks } from '@/lib/nav';
import Logo from '@/components/layout/Logo';
import MapEmbed from '@/components/media/MapEmbed';
import HalftoneBg from '@/components/motion/HalftoneBg';

const socialIcon: Record<string, typeof Facebook> = {
  Facebook,
  LinkedIn: Linkedin,
  Instagram,
  YouTube: Youtube,
};

export default async function Footer() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getCategories(),
  ]);

  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <HalftoneBg grid fade={false} className="opacity-60" />

      {/* CMYK rule across the top edge. */}
      <div
        aria-hidden="true"
        className="relative h-0.5 w-full"
        style={{
          background:
            'linear-gradient(90deg, var(--cyan) 0%, var(--cyan) 33%, var(--magenta) 33%, var(--magenta) 66%, var(--yellow) 66%, var(--yellow) 100%)',
        }}
      />

      <div className="container-page relative py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Identity + socials */}
          <div className="lg:col-span-4">
            <Logo invert />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/60">
              One-stop printing &amp; packaging solutions — machineries, press room
              chemicals, inks, coatings and consumables, backed by dedicated
              technical support across Bangladesh.
            </p>

            <ul className="mt-6 flex gap-2">
              {settings.socials.map((s) => {
                const Icon = socialIcon[s.label] ?? Mail;
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="inline-flex h-10 w-10 items-center justify-center border border-line text-paper/70 transition-colors hover:border-cyan hover:text-cyan"
                    >
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer" className="lg:col-span-2">
            <h2 className="eyebrow text-cyan">Explore</h2>
            <ul className="mt-5 space-y-2.5">
              {footerLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-paper/60 transition-colors hover:text-paper"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Categories */}
          <nav aria-label="Product categories" className="lg:col-span-3">
            <h2 className="eyebrow text-magenta">What We Offer</h2>
            <ul className="mt-5 space-y-2.5">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/products/${c.slug}`}
                    className="text-sm text-paper/60 transition-colors hover:text-paper"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact + map */}
          <div className="lg:col-span-3">
            <h2 className="eyebrow text-cyan">Contact</h2>
            <ul className="mt-5 space-y-4 text-sm text-paper/60">
              <li className="flex gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-magenta" />
                <address className="not-italic leading-relaxed">{settings.address}</address>
              </li>
              <li className="flex gap-3">
                <Phone aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-magenta" />
                <a
                  href={`tel:${settings.phone.replace(/\s/g, '')}`}
                  className="transition-colors hover:text-paper"
                >
                  {settings.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-magenta" />
                <a
                  href={`mailto:${settings.email}`}
                  className="transition-colors hover:text-paper"
                >
                  {settings.email}
                </a>
              </li>
            </ul>

            <MapEmbed
              query={settings.mapQuery}
              title="Proactive Trade International office location"
              heightClass="h-[180px]"
              className="mt-6"
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 font-mono text-xs text-paper/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Proactive Trade International. All rights reserved.</p>
          <p className="tracking-[0.16em]">DHAKA · BANGLADESH</p>
        </div>
      </div>
    </footer>
  );
}
