import type { Metadata, Viewport } from 'next';
import { Archivo, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RouteSweep from '@/components/motion/RouteSweep';
import CursorRegistration from '@/components/motion/CursorRegistration';
import { SITE_URL } from '@/lib/utils';

/**
 * Fonts are downloaded at build time and served from our own origin by
 * next/font — no <link> to Google, no render-blocking request, no CLS.
 */
const display = Archivo({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-display',
});

const body = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      'Proactive Trade International — One-Stop Printing & Packaging Solutions',
    template: '%s | Proactive Trade International',
  },
  description:
    'Trusted supplier of printing and packaging machineries, press room chemicals, inks, coatings and consumables in Bangladesh. Serving 100+ printing and packaging companies.',
  keywords: [
    'printing machinery Bangladesh',
    'packaging solutions Dhaka',
    'CTP machine',
    'press room chemicals',
    'offset printing inks',
    'CTP plates',
    'Proactive Trade International',
  ],
  applicationName: 'Proactive Trade International',
  authors: [{ name: 'Proactive Trade International' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Proactive Trade International',
    locale: 'en_US',
    url: SITE_URL,
    title: 'Proactive Trade International — One-Stop Printing & Packaging Solutions',
    description:
      'Printing and packaging machineries, press room chemicals, inks, coatings and consumables — supplied and supported across Bangladesh.',
    images: [{ url: '/images/og/og-default.png', width: 1200, height: 630, alt: 'Proactive Trade International' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Proactive Trade International',
    description:
      'One-stop printing & packaging solutions — machineries, chemicals, inks and consumables in Bangladesh.',
    images: ['/images/og/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  themeColor: '#0E1116',
  width: 'device-width',
  initialScale: 1,
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Proactive Trade International',
  url: SITE_URL,
  logo: `${SITE_URL}/images/og/og-default.png`,
  foundingDate: '2024',
  description:
    'Supplier of printing and packaging machineries, press room chemicals, inks, coatings and consumables in Bangladesh.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '292, Inner Circular Road, Shatabdi Centre, Fakirapool, Motijheel',
    addressLocality: 'Dhaka',
    postalCode: '1000',
    addressCountry: 'BD',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+880 1855 939 450',
    email: 'info@proactive.com.bd',
    contactType: 'sales',
  },
  sameAs: [
    'https://www.facebook.com/proactivetradeInt',
    'https://www.linkedin.com/company/proactivetradeint',
    'https://www.instagram.com/proactivetradeint',
    'https://www.youtube.com/@proactivetradeint',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-paper antialiased">
        {/*
          Applies the theme before anything paints, so there is no flash of the
          wrong surface. Stored choice wins; otherwise follow the OS. Kept inline
          and blocking on purpose — it is ~200 bytes and must not be deferred.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var s=localStorage.getItem('ptt-theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=d?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})()",
          }}
        />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-band focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-widest focus:text-onband"
        >
          Skip to content
        </a>

        <RouteSweep />
        <CursorRegistration />
        <Header />
        <main id="main">{children}</main>
        <Footer />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
