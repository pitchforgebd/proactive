import { getSiteSettings } from '@/lib/data';
import Section from '@/components/ui/Section';
import MapEmbed from '@/components/media/MapEmbed';
import type { MapData } from '@/lib/sections/schemas';

/**
 * Full-bleed map band. The iframe is never created on first paint — MapEmbed
 * mounts it on scroll-into-range or on click (CLAUDE.md §5.7).
 *
 * The location comes from Settings unless the section overrides it.
 */
const heightClass = {
  sm: 'h-[260px]',
  md: 'h-[340px]',
  lg: 'h-[420px]',
} as const;

export default async function MapSection({ queryOverride, title, height }: MapData) {
  const settings = await getSiteSettings();
  const query = queryOverride?.trim() || settings.mapQuery;
  if (!query) return null;

  return (
    <Section
      tone="paper"
      className="py-0 md:py-0"
      containerClassName="px-0 md:px-0"
    >
      <MapEmbed
        query={query}
        title={title}
        heightClass={heightClass[height]}
        className="border-x-0"
      />
    </Section>
  );
}
