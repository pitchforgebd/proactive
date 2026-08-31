import Script from 'next/script';

import { isGa4Id, isGtmId, isMetaPixelId } from '@/lib/seo/site-seo';
import type { SiteSeoSettings } from '@/lib/types';

/**
 * Public-site analytics loaders. Renders nothing unless each ID is set and
 * shape-valid — admin routes never mount this component.
 */
export default function SiteAnalytics({ seo }: { seo: SiteSeoSettings }) {
  const ga4 = seo.ga4Id.trim();
  const gtm = seo.gtmId.trim();
  const pixel = seo.metaPixelId.trim();

  const loadGa4 = ga4 && isGa4Id(ga4);
  const loadGtm = gtm && isGtmId(gtm);
  const loadPixel = pixel && isMetaPixelId(pixel);

  if (!loadGa4 && !loadGtm && !loadPixel) return null;

  return (
    <>
      {loadGtm && (
        <>
          <Script id="seo-gtm" strategy="afterInteractive">{`
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm}');
          `}</Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      )}

      {loadGa4 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`}
            strategy="afterInteractive"
          />
          <Script id="seo-ga4" strategy="afterInteractive">{`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga4}');
          `}</Script>
        </>
      )}

      {loadPixel && (
        <Script id="seo-meta-pixel" strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixel}');
fbq('track', 'PageView');
        `}</Script>
      )}
    </>
  );
}
