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
          'relative overflow-hidden p-8 md:p-12',
          isVision ? 'bg-paper-2' : 'bg-band text-onband',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute bottom-0 left-0 top-0 w-1',
            isVision ? 'bg-cyan' : 'bg-magenta',
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl',
            isVision ? 'bg-cyan' : 'bg-magenta',
          )}
        />

        {panels && show && (
          <span
            className={cn(
              'inline-flex h-12 w-12 items-center justify-center rounded-xl',
              isVision ? 'bg-cyan/15 text-cyan' : 'bg-magenta/20 text-magenta',
            )}
          >
            <Icon aria-hidden="true" className="h-6 w-6" />
          </span>
        )}
        <Eyebrow
          tone={isVision ? 'cyan' : 'magenta'}
          className={cn(panels && show ? 'mt-6' : undefined, !isVision && 'text-magenta')}
        >
          {label}
        </Eyebrow>
        <p
          className={cn(
            'leading-relaxed',
            isVision ? 'text-ink' : 'text-onband/85',
            panels
              ? 'mt-4 text-base sm:mt-5 sm:text-lg md:text-xl md:leading-relaxed'
              : 'mt-4 text-base sm:mt-6 sm:text-lg',
          )}
        >
          {text}
        </p>
      </MotionReveal>
    );
  };

  return (
    <Section tone={tone} cropMarks={cropMarks}>
      <div
        className={cn(
          'grid overflow-hidden rounded-xl border border-ink/10',
          panels ? 'lg:grid-cols-2' : 'md:grid-cols-2',
        )}
      >
        {panel('vision', visionTitle, visionText, VisionIcon, Boolean(visionIcon), 0)}
        {panel('mission', missionTitle, missionText, MissionIcon, Boolean(missionIcon), 90)}
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
