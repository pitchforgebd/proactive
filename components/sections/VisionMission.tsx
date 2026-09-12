'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Section from '@/components/ui/Section';
import Eyebrow from '@/components/ui/Eyebrow';
import MotionReveal from '@/components/motion/MotionReveal';
import { resolveIcon } from '@/lib/sections/icons';
import { cn } from '@/lib/utils';
import type { VisionMissionData } from '@/lib/sections/schemas';

/**
 * Vision + Mission pair — asymmetric accent panels + Framer reveal.
 */
export default function VisionMission({
  visionTitle,
  visionText,
  visionIcon,
  missionTitle,
  missionText,
  missionIcon,
  variant,
  linkText,
  linkHref,
  tone,
  cropMarks,
}: VisionMissionData) {
  const panels = variant === 'panels';
  const VisionIcon = resolveIcon(visionIcon);
  const MissionIcon = resolveIcon(missionIcon);

  const panel = (
    which: 'vision' | 'mission',
    label: string,
    text: string,
    Icon: ReturnType<typeof resolveIcon>,
    show: boolean,
    delay: number,
  ) => {
    const isVision = which === 'vision';
    return (
      <MotionReveal
        delay={delay}
        className={cn(
          'group relative overflow-hidden p-8 md:p-12',
          isVision ? 'bg-paper-2' : 'bg-band text-onband',
        )}
      >
        {/* Accent bar. The dark panel takes cyan — navy on navy is invisible. */}
        {panels && (
          <span
            aria-hidden="true"
            className={cn(
              'absolute bottom-0 left-0 top-0 w-1',
              isVision ? 'bg-magenta' : 'bg-cyan',
            )}
          />
        )}

        {panels && show && (
          <span
            className={cn(
              'inline-flex h-12 w-12 items-center justify-center rounded-xl',
              isVision ? 'bg-magenta/10 text-magenta' : 'bg-cyan/15 text-cyan',
            )}
          >
            <Icon aria-hidden="true" className="h-6 w-6" />
          </span>
        )}

        {/* Each half is one plate of the pair, so it carries its own index. */}
        <Eyebrow
          index={panels ? undefined : isVision ? '01' : '02'}
          tone={isVision ? 'magenta' : 'cyan'}
          className={cn(panels && show && 'mt-6')}
        >
          {label}
        </Eyebrow>

        <p
          className={cn(
            // Opt out of the site-wide justify: at this measure it opens
            // rivers of white space between the words.
            'text-left leading-relaxed',
            isVision ? 'text-ink' : 'text-onband/85',
            panels
              ? 'mt-4 text-base sm:mt-5 sm:text-lg md:text-xl md:leading-relaxed'
              : 'mt-5 text-base sm:mt-6 sm:text-lg sm:leading-[1.65]',
          )}
        >
          {text}
        </p>

        {/* Press mark that runs out under the statement on hover. */}
        {!panels && (
          <span
            aria-hidden="true"
            className={cn(
              'mt-7 block h-px w-8 transition-[width] duration-500 ease-press group-hover:w-20',
              isVision ? 'bg-magenta/50' : 'bg-cyan/60',
            )}
          />
        )}
      </MotionReveal>
    );
  };

  return (
    <Section tone={tone} cropMarks={cropMarks}>
      <div
        className={cn(
          'relative grid overflow-hidden rounded-2xl border border-ink/10',
          panels ? 'lg:grid-cols-2' : 'md:grid-cols-2',
        )}
      >
        {panel('vision', visionTitle, visionText, VisionIcon, Boolean(visionIcon), 0)}
        {panel('mission', missionTitle, missionText, MissionIcon, Boolean(missionIcon), 90)}

        {/* Registration seam — the line where the two plates meet, marked at
            its centre the way a press sheet carries a register diamond. Only
            once the halves actually sit side by side. */}
        {!panels && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-cyan/40 md:block"
          >
            <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-cyan" />
          </span>
        )}
      </div>

      {linkText && (
        <MotionReveal delay={140} className="mt-8">
          <Link
            href={linkHref || '/vision-mission'}
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase text-graphite transition-colors hover:text-magenta"
          >
            {linkText}
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
            />
          </Link>
        </MotionReveal>
      )}
    </Section>
  );
}
