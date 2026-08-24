import Section from '@/components/ui/Section';
import Eyebrow from '@/components/ui/Eyebrow';
import RichText from '@/components/ui/RichText';
import RevealOnView from '@/components/motion/RevealOnView';
import type { RichTextData } from '@/lib/sections/schemas';

/**
 * A block of editor-authored rich text under an optional eyebrow.
 *
 * The HTML is sanitized twice: once server-side when the dashboard saves it,
 * and again here inside <RichText/> on every render.
 */
export default function RichTextSection({
  eyebrow,
  index,
  html,
  tone,
  cropMarks,
  narrow,
}: RichTextData) {
  return (
    <Section tone={tone} cropMarks={cropMarks}>
      <RevealOnView>
        {eyebrow && (
          <Eyebrow index={index} tone="magenta" className="mb-6">
            {eyebrow}
          </Eyebrow>
        )}
        <RichText
          html={html}
          invert={tone === 'ink'}
          className={narrow ? 'max-w-3xl' : undefined}
        />
      </RevealOnView>
    </Section>
  );
}
