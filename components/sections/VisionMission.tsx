import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Section from '@/components/ui/Section';
import Eyebrow from '@/components/ui/Eyebrow';
import RevealOnView from '@/components/motion/RevealOnView';
import { resolveIcon } from '@/lib/sections/icons';
import { cn } from '@/lib/utils';
import type { VisionMissionData } from '@/lib/sections/schemas';

/**
 * Vision + Mission pair.
 *
 *   strip  — condensed home band, no icons, optional "in full" link
 *   panels — the full page treatment: larger type, an icon per panel
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
  ) => {
    const isVision = which === 'vision';
    return (
      <RevealOnView
        delay={isVision ? 0 : 80}
        className="bg-paper-2 p-8 md:p-12"
      >
        {panels && show && (
          <Icon
            aria-hidden="true"
            className={cn('h-7 w-7', isVision ? 'text-cyan' : 'text-magenta')}
          />
        )}
        <Eyebrow
          tone={isVision ? 'cyan' : 'magenta'}
          className={panels && show ? 'mt-6' : undefined}
        >
          {label}
        </Eyebrow>
        <p
          className={cn(
            'leading-relaxed text-ink',
            panels
              ? 'mt-5 text-lg md:text-xl md:leading-relaxed'
              : 'mt-6 text-lg',
          )}
        >
          {text}
        </p>
      </RevealOnView>
    );
  };

  return (
    <Section tone={tone} cropMarks={cropMarks}>
      <div
        className={cn(
          'grid gap-px overflow-hidden border border-ink/10 bg-ink/10',
          panels ? 'lg:grid-cols-2' : 'md:grid-cols-2',
        )}
      >
        {panel('vision', visionTitle, visionText, VisionIcon, Boolean(visionIcon))}
        {panel('mission', missionTitle, missionText, MissionIcon, Boolean(missionIcon))}
      </div>

      {linkText && (
        <div className="mt-8">
          <Link
            href={linkHref || '/vision-mission'}
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-graphite transition-colors hover:text-magenta"
          >
            {linkText}
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
            />
          </Link>
        </div>
      )}
    </Section>
  );
}
