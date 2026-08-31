'use client';

import Image from 'next/image';
import type { Partner } from '@/lib/types';
import MotionReveal from '@/components/motion/MotionReveal';

/**
 * Partner logo marquee on paper plates — Framer intro + CSS track.
 */
export default function PartnerMarquee({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null;

  const Row = ({ hidden }: { hidden: boolean }) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-5 pr-5"
    >
      {partners.map((p) => (
        <li key={`${p.id}-${hidden}`} className="shrink-0">
          <div className="flex h-[72px] w-[148px] items-center justify-center rounded-xl border border-ink/10 bg-paper-2 px-4 transition duration-300 hover:border-cyan/40 hover:shadow-[0_12px_28px_-20px_rgba(14,17,22,0.45)] dark:border-line dark:bg-band-2">
            <Image
              src={p.logo}
              alt={hidden ? '' : p.name}
              width={160}
              height={60}
              sizes="140px"
              loading="lazy"
              className="h-[40px] w-auto opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 dark:brightness-0 dark:invert"
            />
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <MotionReveal>
      <div
        className="group relative overflow-hidden py-1"
        style={{
          maskImage:
            'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        }}
      >
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          <Row hidden={false} />
          <Row hidden />
        </div>
      </div>
    </MotionReveal>
  );
}
