import { sectionComponents } from '@/lib/sections/components';
import { getSectionEntry, isSectionType } from '@/lib/sections/registry';
import type { PageSection } from '@/lib/types';

/**
 * Renders a page's sections from the database.
 *
 * Every section is validated against its own zod schema before its component
 * sees the data. Three failure modes are handled deliberately, because all are
 * reachable from the dashboard and none may take a public page down:
 *
 *   Unknown type  — a developer removed a section type from the registry while
 *                   instances of it still exist in the database.
 *   Invalid data  — a schema gained a required field, or a row was edited
 *                   outside the dashboard.
 *   Failed load   — the component chunk could not be imported.
 *
 * In every case the section is skipped and the rest of the page renders. Each
 * skip is logged on the server, because a section that quietly stops appearing
 * is harder to diagnose than one that never appeared at all.
 *
 * Components are loaded lazily (lib/sections/components.ts) so a page only ships
 * the JavaScript for the section types it actually uses. Ordering and the
 * visible filter are applied here as well as in the query, so this component is
 * correct regardless of who calls it.
 */
export default async function SectionRenderer({
  sections,
  pageSlug,
}: {
  sections: PageSection[];
  /** Only used to make the skip warnings identifiable in the log. */
  pageSlug?: string;
}) {
  const ordered = sections
    .filter((s) => s.visible)
    .slice()
    .sort((a, b) => a.order - b.order);

  const rendered = await Promise.all(
    ordered.map(async (section) => {
      const where = `${section.id} on "${pageSlug ?? section.pageSlug}"`;
      const entry = getSectionEntry(section.type);

      if (!entry || !isSectionType(section.type)) {
        console.warn(
          `[sections] skipped ${where}: unknown type "${section.type}" ` +
            '(not in the registry).',
        );
        return null;
      }

      const parsed = entry.schema.safeParse(section.data);

      if (!parsed.success) {
        console.warn(
          `[sections] skipped ${where}: data failed the "${section.type}" schema — ` +
            parsed.error.issues
              .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
              .join('; '),
        );
        return null;
      }

      try {
        const { default: Component } = await sectionComponents[section.type]();
        return <Component key={section.id} {...parsed.data} />;
      } catch (error) {
        console.error(`[sections] skipped ${where}: component failed to load —`, error);
        return null;
      }
    }),
  );

  return <>{rendered}</>;
}
