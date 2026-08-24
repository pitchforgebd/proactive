import CTABand from '@/components/ui/CTABand';
import type { CtaData } from '@/lib/sections/schemas';

/**
 * Closing contact band. The phone and email inside it come from Settings, so
 * changing the company number in the dashboard updates every page at once.
 */
export default function CTA({
  eyebrow,
  heading,
  text,
  buttonText,
  buttonHref,
}: CtaData) {
  return (
    <CTABand
      eyebrow={eyebrow}
      title={heading}
      lede={text}
      buttonText={buttonText}
      buttonHref={buttonHref}
    />
  );
}
