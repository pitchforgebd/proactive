import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/utils';

/**
 * The ONLY place dangerouslySetInnerHTML is allowed.
 *
 * Rich HTML fields (category/product/news bodies) come from Summernote in the
 * Phase 2 dashboard, so every one of them is sanitized here before it renders.
 * Styling comes from the .prose class in globals.css.
 */
export default function RichText({
  html,
  invert = false,
  className,
}: {
  html: string;
  /** Use on ink surfaces. */
  invert?: boolean;
  className?: string;
}) {
  if (!html?.trim()) return null;

  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
  });

  return (
    <div
      className={cn('prose', invert && 'prose-invert', className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
