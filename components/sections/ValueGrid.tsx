import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import RevealOnView from '@/components/motion/RevealOnView';
import { resolveIcon } from '@/lib/sections/icons';
import { cn } from '@/lib/utils';
import type { ValueGridData } from '@/lib/sections/schemas';

/**
 * Feature / value grid — Why Choose Us, Core Values, the Global Sourcing
 * pillars. One coded component, three coded variants:
 *
 *   hairline — cells separated by a 1px rule, filled surface (Why Choose Us)
 *   rule     — open cells under a heavy top rule (home Core Values)
 *   numbered — hairline cells with a registration index (Vision & Mission)
 *
 * Icons are stored BY NAME in section data and resolved through the whitelist
 * in lib/sections/icons.ts, so reordering the list can never reshuffle them.
 */
const columnClass: Record<ValueGridData['columns'], string> = {
  '2': 'sm:grid-cols-2',
  '3': 'md:grid-cols-2 lg:grid-cols-3',
  '4': 'sm:grid-cols-2 lg:grid-cols-4',
  '5': 'sm:grid-cols-2 lg:grid-cols-5',
};

export default function ValueGrid({
  eyebrow,
  index,
  title,
  lede,
  linkText,
  linkHref,
  items,
  variant,
  columns,
  tone,
  halftone,
  cropMarks,
}: ValueGridData) {
  const invert = tone === 'ink';
  const hasHeading = Boolean(eyebrow || title);
  // When the section carries no heading of its own, the item titles are the
  // page's next heading level.
  const ItemTitle = hasHeading ? 'h3' : 'h2';

  const isOpen = variant === 'rule';

  return (
    <Section tone={tone} halftone={halftone} cropMarks={cropMarks}>
      {hasHeading && (
        <SectionHeading
          eyebrow={eyebrow}
          index={index}
          title={title ?? ''}
          lede={lede}
          link={linkText ? { href: linkHref || '/', label: linkText } : undefined}
          invert={invert}
        />
      )}

      <ul
        className={cn(
          'grid',
          columnClass[columns],
          hasHeading ? 'mt-12' : '',
          isOpen
            ? 'gap-6'
            : cn(
                'gap-px overflow-hidden border',
                invert ? 'border-line bg-line' : 'border-ink/10 bg-ink/10',
              ),
        )}
      >
        {items.map((item, i) => {
          const Icon = resolveIcon(item.icon);
          const accent = i % 2 === 0 ? 'text-cyan' : 'text-magenta';

          return (
            <RevealOnView
              as="li"
              key={item.title}
              delay={i * 60}
              className={cn(
                isOpen
                  ? cn('border-t-2 pt-6', invert ? 'border-onband' : 'border-ink')
                  : cn('p-7', invert ? 'bg-band' : 'bg-paper-2', variant === 'numbered' && 'p-8'),
              )}
            >
              {variant === 'numbered' ? (
                <div className="flex items-start justify-between gap-4">
                  <Icon aria-hidden="true" className={cn('h-6 w-6', accent)} />
                  <span
                    className={cn(
                      'font-mono text-xs',
                      invert ? 'text-onband/25' : 'text-ink/25',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
              ) : (
                <Icon
                  aria-hidden="true"
                  className={cn(isOpen ? 'h-5 w-5' : 'h-6 w-6', isOpen ? accent : invert ? 'text-cyan' : accent)}
                />
              )}

              <ItemTitle
                className={cn(
                  'text-base font-semibold leading-snug',
                  isOpen ? 'mt-5' : 'mt-6',
                  invert ? 'text-onband' : 'text-ink',
                )}
              >
                {item.title}
              </ItemTitle>

              {item.text && (
                <p
                  className={cn(
                    'mt-3 text-sm leading-relaxed',
                    invert ? 'text-onband/55' : 'text-graphite',
                  )}
                >
                  {item.text}
                </p>
              )}
            </RevealOnView>
          );
        })}
      </ul>
    </Section>
  );
}
