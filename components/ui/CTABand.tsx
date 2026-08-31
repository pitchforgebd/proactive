import { getSiteSettings } from '@/lib/data';
import CTABandClient from '@/components/ui/CTABandClient';

/**
 * Closing contact band. Server wrapper supplies live Settings contact info;
 * motion + layout live in the client shell.
 */
export default async function CTABand({
  eyebrow = 'Get in Touch',
  title = 'Tell us what you print. We will specify the rest.',
  lede = 'Machinery selection, consumable programmes, technical service — talk to our team about your production.',
  buttonText = 'Contact Us',
  buttonHref = '/contact',
}: {
  eyebrow?: string;
  title?: string;
  lede?: string;
  buttonText?: string;
  buttonHref?: string;
}) {
  const settings = await getSiteSettings();

  return (
    <CTABandClient
      eyebrow={eyebrow}
      title={title}
      lede={lede}
      buttonText={buttonText}
      buttonHref={buttonHref}
      phone={settings.phone}
      email={settings.email}
    />
  );
}
