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
  const isProof = variant === 'proof';

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
          hasHeading ? 'mt-14' : '',
          // Open layouts need room around them; the corner frames especially,
          // or adjacent brackets read as one broken box.
          isOpen || isProof ? 'gap-8 md:gap-10' : 'gap-5 md:gap-6',
        )}
      >
        {items.map((item, i) => {
          const Icon = resolveIcon(item.icon);
          // One accent per surface, not alternating per card — a checkerboard
          // of two accents across a 4- or 5-up grid reads as noise, and cyan
          // fails contrast on paper anyway.
          const accent = invert ? 'text-cyan' : 'text-magenta';
          const accentBg = invert ? 'bg-cyan/10' : 'bg-magenta/10';

          /* ---- "proof" — the corner-marked proof frame --------------------
             No card, no fill, no full border: each value sits inside four
             registration corners, the way an element is framed on a press
             proof. The corners extend and ink in on hover — the one moving
             part, so the grid stays quiet at rest. */
          if (isProof) {
            const corner = invert
              ? 'border-onband/25 group-hover:border-cyan'
              : 'border-ink/20 group-hover:border-magenta';

            return (
              <MotionReveal
                as="li"
                key={item.title}
                delay={i * 70}
                className="group relative p-6 md:p-7"
              >
                {(
                  [
                    'left-0 top-0 border-l border-t',
                    'right-0 top-0 border-r border-t',
                    'left-0 bottom-0 border-b border-l',
                    'right-0 bottom-0 border-b border-r',
                  ] as const
                ).map((pos) => (
                  <span
                    key={pos}
                    aria-hidden="true"
                    className={cn(
                      'absolute h-4 w-4 transition-all duration-500 ease-press group-hover:h-6 group-hover:w-6',
                      pos,
                      corner,
                    )}
                  />
                ))}

                <Icon aria-hidden="true" className={cn('h-6 w-6', accent)} />

                <ItemTitle
                  className={cn(
                    'mt-6 text-base font-semibold leading-snug',
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
          }

          /* ---- "rule" — the open ledger -----------------------------------
             No card, no box: an outlined register numeral over a hairline
             column rule that inks in from the top on hover. Its own markup
             rather than conditionals threaded through the card layout. */
          if (isOpen) {
            return (
              <MotionReveal
                as="li"
                key={item.title}
                delay={i * 70}
                className="group relative pl-5"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute bottom-0 left-0 top-0 w-px',
                    invert ? 'bg-onband/15' : 'bg-ink/10',
                  )}
                >
                  <span className="absolute inset-x-0 top-0 h-0 bg-cyan transition-[height] duration-500 ease-press group-hover:h-full" />
                </span>

                <span
                  aria-hidden="true"
                  className={cn(
                    'numeral-outline block font-display text-2xl font-extrabold leading-none sm:text-3xl',
                    invert && 'numeral-outline--invert',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <Icon aria-hidden="true" className={cn('mt-6 h-5 w-5', accent)} />

                <ItemTitle
                  className={cn(
                    'mt-4 text-base font-semibold leading-snug',
                    invert ? 'text-onband' : 'text-ink',
                  )}
                >
                  {item.title}
                </ItemTitle>

                {item.text && (
                  <p
                    className={cn(
                      'mt-2.5 text-sm leading-relaxed',
                      invert ? 'text-onband/55' : 'text-graphite',
                    )}
                  >
                    {item.text}
                  </p>
                )}
              </MotionReveal>
            );
          }

          return (
            <MotionReveal
              as="li"
              key={item.title}
              delay={i * 70}
              className={cn(
                'group relative overflow-hidden rounded-xl border p-7 transition-shadow duration-300 md:p-8',
                invert
                  ? 'border-line bg-band-2/60 hover:border-cyan/40 hover:shadow-[0_20px_50px_-32px_rgba(0,174,239,0.45)]'
                  : 'border-ink/10 bg-paper-2 hover:border-magenta/30 hover:shadow-[0_20px_50px_-32px_rgba(14,17,22,0.35)]',
                variant === 'numbered' && 'p-8',
              )}
            >
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
                    accentBg,
                  )}
                >
                  <Icon aria-hidden="true" className={cn('h-5 w-5', accent)} />
                </span>
              )}

              <ItemTitle
                className={cn(
                  'mt-6 text-base font-semibold leading-snug',
                  invert ? 'text-onband' : 'text-ink',
                )}
              >
                {item.title}
              </ItemTitle>

              {item.text && (
                <p
                  className={cn(
                    'mt-3.5 text-sm leading-relaxed',
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
