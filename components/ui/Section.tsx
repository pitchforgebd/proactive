import { cn } from '@/lib/utils';
import CropMarks from '@/components/motion/CropMarks';
import PressAtmosphere from '@/components/motion/PressAtmosphere';

type Tone = 'paper' | 'paper-2' | 'ink';

const toneClass: Record<Tone, string> = {
  paper: 'bg-paper text-ink',
  'paper-2': 'bg-paper-2 text-ink',
  ink: 'bg-band text-onband',
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

  return (
    <Tag
      id={id}
      className={cn('relative py-16 md:py-24', toneClass[tone], className)}
    >
      {halftone && (
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 halftone',
            tone !== 'ink' && 'halftone-ink',
          )}
        />
      )}
      {atmosphereMode && tone === 'ink' && (
        <PressAtmosphere intensity={atmosphereMode} />
      )}
      <div className={cn('container-page relative', containerClassName)}>
        {cropMarks && <CropMarks tone={tone === 'ink' ? 'light' : 'dark'} />}
        {children}
      </div>
    </Tag>
  );
}
