'use client';

import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import MotionReveal from '@/components/motion/MotionReveal';
import { resolveIcon } from '@/lib/sections/icons';
import { cn } from '@/lib/utils';
import type { ValueGridData } from '@/lib/sections/schemas';

const columnClass: Record<ValueGridData['columns'], string> = {
  '2': 'sm:grid-cols-2',
  '3': 'md:grid-cols-2 lg:grid-cols-3',
  '4': 'sm:grid-cols-2 lg:grid-cols-4',
  '5': 'sm:grid-cols-2 lg:grid-cols-5',
};

/**
 * Feature / value grid — Framer reveals + hover lift on hairline/numbered cards.
 */
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
          isOpen ? 'gap-6 md:gap-8' : 'gap-4',
        )}
      >
        {items.map((item, i) => {
          const Icon = resolveIcon(item.icon);
          const accent = i % 2 === 0 ? 'text-cyan' : 'text-magenta';
          const accentBg = i % 2 === 0 ? 'bg-cyan/10' : 'bg-magenta/10';

          return (
            <MotionReveal
              as="li"
              key={item.title}
              delay={i * 70}
              className={cn(
                isOpen
                  ? cn(
                      'group border-t-2 pt-6 transition-colors',
                      invert ? 'border-onband hover:border-cyan' : 'border-ink hover:border-magenta',
                    )
                  : cn(
                      'group relative overflow-hidden rounded-xl border p-7 transition-shadow duration-300 md:p-8',
                      invert
                        ? 'border-line bg-band-2/60 hover:border-cyan/40 hover:shadow-[0_20px_50px_-32px_rgba(0,174,239,0.45)]'
                        : 'border-ink/10 bg-paper-2 hover:border-magenta/30 hover:shadow-[0_20px_50px_-32px_rgba(14,17,22,0.35)]',
                      variant === 'numbered' && 'p-8',
                    ),
              )}
            >
              {!isOpen && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 ease-press group-hover:scale-x-100',
                    i % 2 === 0 ? 'bg-cyan' : 'bg-magenta',
                  )}
                />
              )}

              {variant === 'numbered' ? (
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={cn(
                      'inline-flex h-11 w-11 items-center justify-center rounded-lg',
                      accentBg,
                    )}
                  >
                    <Icon aria-hidden="true" className={cn('h-5 w-5', accent)} />
                  </span>
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
                <span
                  className={cn(
                    'inline-flex h-11 w-11 items-center justify-center rounded-lg',
                    isOpen ? 'bg-transparent p-0' : accentBg,
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      isOpen ? 'h-5 w-5' : 'h-5 w-5',
                      isOpen ? accent : invert ? 'text-cyan' : accent,
                    )}
                  />
                </span>
              )}

              <ItemTitle
                className={cn(
                  'text-base font-semibold leading-snug',
                  isOpen ? 'mt-5' : 'mt-5',
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
            </MotionReveal>
          );
        })}
      </ul>
    </Section>
  );
}
