import PageHeroBand from '@/components/layout/PageHero';
import type { PageHeroData } from '@/lib/sections/schemas';

/**
 * Inner-page header band as a section type.
 *
 * The band itself (components/layout/PageHero) was already prop-driven in
 * Phase 1, so this is the adapter that hands it section data — including the
 * breadcrumb trail, which is now editable rather than written into each route.
 */
export default function PageHeroSection({
  eyebrow,
  title,
  lede,
  image,
  imageAlt,
  compact,
  crumbs,
}: PageHeroData) {
  return (
    <PageHeroBand
      eyebrow={eyebrow}
      title={title}
      lede={lede}
      image={image || undefined}
      imageAlt={imageAlt ?? ''}
      compact={compact}
      crumbs={crumbs.length > 0 ? crumbs : undefined}
    />
  );
}
