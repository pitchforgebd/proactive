import { cn } from '@/lib/utils';
import CropMarks from '@/components/motion/CropMarks';
import PressAtmosphere from '@/components/motion/PressAtmosphere';

type Tone = 'paper' | 'paper-2' | 'tint' | 'ink';

const toneClass: Record<Tone, string> = {
  paper: 'bg-paper text-ink',
  'paper-2': 'bg-paper-2 text-ink',
  /** Pale sky wash — separates a light section from its paper / white
   *  neighbours without adding another dark-navy band. */
  tint: 'bg-cyan/[0.08] text-ink',
  ink: 'band-surface text-onband',
};

interface SectionProps {
  children: React.ReactNode;
  /** Surface colour. Keep ~90% of the page on paper or ink (§6). */
  tone?: Tone;
  /** Faint corner crop marks — frames a major section. */
  cropMarks?: boolean;
  /** Halftone dot field. Reads best on ink. */
  halftone?: boolean;
  /** Futuristic CMYK press scan / orbit (ink bands only). */
  atmosphere?: boolean | 'soft' | 'normal';
  className?: string;
  containerClassName?: string;
  id?: string;
  as?: 'section' | 'div' | 'article' | 'footer';
}

/** Page section: consistent rhythm, optional printing-identity framing. */
export default function Section({
  children,
  tone = 'paper',
  cropMarks = false,
  halftone = false,
  atmosphere = false,
  className,
  containerClassName,
  id,
  as: Tag = 'section',
}: SectionProps) {
  const atmosphereMode =
    atmosphere === true ? 'normal' : atmosphere === false ? null : atmosphere;
  const dark = tone === 'ink';

  return (
    <Tag
      id={id}
      className={cn('relative py-14 sm:py-20 md:py-28', toneClass[tone], className)}
    >
      {halftone && (
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 halftone',
            !dark && 'halftone-ink',
          )}
        />
      )}
      {atmosphereMode && dark && (
        <PressAtmosphere intensity={atmosphereMode} />
      )}
      <div className={cn('container-page relative', containerClassName)}>
        {cropMarks && <CropMarks tone={dark ? 'light' : 'dark'} />}
        {children}
      </div>
    </Tag>
  );
}
