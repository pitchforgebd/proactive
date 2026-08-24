import { getSiteSettings } from '@/lib/data';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RouteSweep from '@/components/motion/RouteSweep';
import CursorRegistration from '@/components/motion/CursorRegistration';
import { SITE_URL } from '@/lib/utils';

/**
 * PUBLIC SITE CHROME.
 *
 * Split out of the root layout in Phase 2 so /admin can have its own shell.
 * Route groups do not affect URLs — every path under (site) is unchanged.
 */
/**
 * Organization JSON-LD.
 *
 * Built from Settings rather than hardcoded, so an address, phone number or
 * social link changed in the dashboard stays consistent with what search
 * engines are told. A social link cleared in Settings disappears from sameAs.
 */
function organizationJsonLd(settings: Awaited<ReturnType<typeof getSiteSettings>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.companyName,
    url: SITE_URL,
    logo: `${SITE_URL}/images/og/og-default.png`,
    foundingDate: '2024',
    description:
      'Supplier of printing and packaging machineries, press room chemicals, inks, coatings and consumables in Bangladesh.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address,
      addressLocality: 'Dhaka',
      postalCode: '1000',
      addressCountry: 'BD',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings.phone,
      email: settings.email,
      contactType: 'sales',
    },
    sameAs: settings.socials.map((s) => s.href),
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <RouteSweep />
      <CursorRegistration />
      <Header />
      <main id="main">{children}</main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd(settings)),
        }}
      />
    </>
  );
}
