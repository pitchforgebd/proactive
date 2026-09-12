import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { getCategories, getSiteSettings } from '@/lib/data';
import { footerLinks } from '@/lib/nav';
import Logo from '@/components/layout/Logo';

const socialIcon: Record<string, typeof Facebook> = {
  Facebook,
  LinkedIn: Linkedin,
  Instagram,
  YouTube: Youtube,
};

/** Small bullet + bold heading used for the two list columns below. */
function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-lg font-bold text-onband sm:text-xl">
      <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-cyan" />
      {children}
    </h2>
  );
}

export default async function Footer() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getCategories(),
  ]);

  const qrSrc = settings.qrCode.trim();
  // The footer band is navy in BOTH themes, so it takes a single logo. Falls
  // back to the header logo when Settings → Footer logo is empty.
  const footerLogo = settings.logoFooter || settings.logo || undefined;

  return (
    <footer className="relative overflow-hidden bg-band text-onband">
      {/* Signature rule across the top edge — sky-blue into navy. */}
      <div
        aria-hidden="true"
        className="h-0.5 w-full"
        style={{ background: 'linear-gradient(90deg, var(--cyan), var(--magenta))' }}
      />

      <div className="container-page relative py-14 md:py-20">
        <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
          {/* Identity + tagline + socials */}
          <div className="lg:col-span-4">
            <Logo
              invert
              src={footerLogo}
              title={settings.logoTitle}
              subtitle={settings.logoSubtitle}
            />
            <p className="footer-tagline mt-5 max-w-sm text-sm leading-relaxed text-onband/55">
              {settings.footerTagline}
            </p>

            <ul className="mt-6 flex gap-2.5">
              {settings.socials.map((s) => {
                const Icon = socialIcon[s.label] ?? Mail;
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-onband/[0.04] text-onband/70 transition-colors hover:border-cyan hover:text-cyan"
                    >
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* What We Offer — categories */}
          <nav aria-label="Product categories" className="lg:col-span-3">
            <ColumnHeading>What We Offer</ColumnHeading>
            <ul className="footer-links mt-6 flex list-none flex-col items-start gap-4 p-0">
              {categories.map((c) => (
                <li key={c.slug} className="w-auto max-w-[15rem]">
                  <Link
                    href={`/products/${c.slug}`}
                    className="inline-block text-left text-[15px] font-medium leading-snug text-onband/65 transition-colors hover:text-cyan"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact info — icon-boxed rows */}
          <div className="lg:col-span-3">
            <ColumnHeading>Contact Info</ColumnHeading>
            <ul className="mt-6 flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-onband/[0.04]">
                  <Mail aria-hidden="true" className="h-4 w-4 text-onband/70" />
                </span>
                <span>
                  <span className="eyebrow block text-onband/40">Email Us</span>
                  <a
                    href={`mailto:${settings.email}`}
                    className="mt-0.5 block text-sm font-semibold text-onband transition-colors hover:text-cyan"
                  >
                    {settings.email}
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-onband/[0.04]">
                  <Phone aria-hidden="true" className="h-4 w-4 text-onband/70" />
                </span>
                <span>
                  <span className="eyebrow block text-onband/40">Call Us</span>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, '')}`}
                    className="mt-0.5 block text-sm font-semibold text-onband transition-colors hover:text-cyan"
                  >
                    {settings.phone}
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-onband/[0.04]">
                  <MapPin aria-hidden="true" className="h-4 w-4 text-onband/70" />
                </span>
                <span>
                  <span className="eyebrow block text-onband/40">Head Office</span>
                  <address className="mt-0.5 max-w-[15rem] text-sm font-semibold not-italic leading-relaxed text-onband">
                    {settings.address}
                  </address>
                </span>
              </li>
            </ul>
          </div>

          {/* Connect on WhatsApp — a plain uploaded image. The plate is a fixed
              white, never a theme token: a QR has to stay dark-on-white in both
              themes or it stops scanning. */}
          {qrSrc && (
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold leading-snug text-onband sm:text-xl">
                Connect on
                <br />
                WhatsApp
              </h2>

              <div className="mt-6 flex flex-col items-start gap-3">
                <div className="rounded-2xl bg-white p-3 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]">
                  <Image
                    src={qrSrc}
                    alt={settings.qrCodeCaption || 'WhatsApp QR code — Proactive Trade International'}
                    width={152}
                    height={152}
                    sizes="152px"
                    className="h-32 w-32 rounded-md object-contain sm:h-[152px] sm:w-[152px]"
                  />
                </div>
                <p className="max-w-[10rem] text-xs leading-snug text-onband/55">
                  {settings.qrCodeCaption || 'Scan to chat with us instantly'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick links — one centered row, not a fifth column.
            NOTE: deliberately NOT the `.footer-links` class — that class
            forces a left-aligned column (see globals.css) for the stacked
            sidebar lists; this row needs to stay horizontal + centered. */}
        <nav aria-label="Footer" className="mt-14 border-t border-line pt-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 p-0">
            {footerLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-[15px] font-semibold text-onband/70 transition-colors hover:text-cyan"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 text-xs text-onband/40 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-start">© 2026 Proactive Trade International. All rights reserved.</p>
          <p className="text-start">DHAKA · BANGLADESH</p>
        </div>
      </div>
    </footer>
  );
}
