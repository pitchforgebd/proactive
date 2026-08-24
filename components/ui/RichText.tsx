import { sanitizeHtml } from '@/lib/sanitize';
import { cn } from '@/lib/utils';

/**
 * The ONLY place dangerouslySetInnerHTML is allowed.
 *
 * Rich HTML fields (page sections, category/product/news bodies) come from
 * Summernote in the dashboard and are already sanitized on save — this is the
 * second pass, so content that reached the database by any other route still
 * cannot execute. Styling comes from the .prose class in globals.css.
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
  const clean = sanitizeHtml(html);
  if (!clean) return null;

  return (
    <div
      className={cn('prose', invert && 'prose-invert', className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
