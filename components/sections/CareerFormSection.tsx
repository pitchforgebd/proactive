import { getJobOpenings } from '@/lib/data';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import { LazyCareerForm } from '@/components/forms/LazyForms';
import type { CareerFormData } from '@/lib/sections/schemas';

/**
 * The application form. Its "Position applied for" select is populated from the
 * live job openings collection, so a role added in the dashboard is immediately
 * selectable here.
 */
export default async function CareerFormSection({
  eyebrow,
  index,
  title,
  lede,
  tone,
}: CareerFormData) {
  const openings = await getJobOpenings();

  return (
    <Section tone={tone} id="apply">
      <SectionHeading
        eyebrow={eyebrow}
        index={index}
        title={title ?? ''}
        lede={lede}
        invert={tone === 'ink'}
      />

      <div className="mt-12 max-w-3xl">
        <LazyCareerForm openings={openings} />
      </div>
    </Section>
  );
}
