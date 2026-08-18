import Image from 'next/image';
import type { Partner } from '@/lib/types';

/**
 * Continuous partner logo marquee. Pure CSS animation on a duplicated track —
 * no JS, no measurement, no layout thrash. The duplicate half is aria-hidden so
 * screen readers hear each partner once. Pauses on hover; the global
 * reduced-motion rule stops it entirely.
 */
export default function PartnerMarquee({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null;

  const Row = ({ hidden }: { hidden: boolean }) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-14 pr-14"
    >
      {partners.map((p) => (
        <li key={`${p.id}-${hidden}`} className="shrink-0">
          <Image
            src={p.logo}
            alt={hidden ? '' : p.name}
            width={160}
            height={60}
            sizes="160px"
            loading="lazy"
            className="h-[46px] w-auto opacity-55 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className="group relative overflow-hidden"
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
  );
}
