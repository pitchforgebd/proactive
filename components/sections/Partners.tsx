import { getPartners } from '@/lib/data';
import Section from '@/components/ui/Section';
import PartnerMarquee from '@/components/media/PartnerMarquee';
import { cn } from '@/lib/utils';
import type { PartnersData } from '@/lib/sections/schemas';

/**
 * Partner logo marquee. Logos come from the partners collection (dashboard),
 * the caption above them is section content.
 */
export default async function Partners({ title, tone }: PartnersData) {
  const partners = await getPartners();
  if (partners.length === 0) return null;

  return (
    <Section tone={tone} className="py-14 md:py-16">
      {title && (
        <p
          className={cn(
            'eyebrow text-center',
            tone === 'ink' ? 'text-onband/55' : 'text-graphite',
          )}
        >
          {title}
        </p>
      )}
      <div className={title ? 'mt-10' : undefined}>
        <PartnerMarquee partners={partners} />
      </div>
    </Section>
  );
}
