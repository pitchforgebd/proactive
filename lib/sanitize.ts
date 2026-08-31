/**
 * HTML sanitization — one configuration, used on both ends.
 *
 * Rich HTML enters the system from Summernote in the dashboard and from the
 * seed script. It is sanitized on SAVE (so nothing dangerous is ever stored)
 * and again on RENDER inside <RichText/> (so anything already in the database,
 * or written by a future import, still cannot execute). Defence in depth —
 * PHASE2-BACKEND.md §14.
 *
 * Keeping the config here rather than duplicating it means the two passes can
 * never drift apart and quietly disagree about what is allowed.
 */
import DOMPurify from 'isomorphic-dompurify';
import type { Config } from 'dompurify';

export const SANITIZE_CONFIG: Config = {
  USE_PROFILES: { html: true },
  // Links from the editor may open in a new tab.
  ADD_ATTR: ['target', 'rel'],
  // No inline styling (the design lives in code), no embedded documents, no
  // forms — the only forms on the site are the coded ones.
  FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'input'],
  FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
};

// Once per process: target=_blank without noopener lets the opened page reach
// window.opener (tabnabbing). Force the safe rel on every sanitize pass.
let hooksRegistered = false;
function ensureHooks() {
  if (hooksRegistered) return;
  hooksRegistered = true;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // isomorphic-dompurify may not share the same Element constructor as the
    // host, so duck-type rather than using instanceof.
    if (
      typeof (node as { tagName?: string }).tagName === 'string' &&
      (node as { tagName: string }).tagName === 'A' &&
      typeof (node as Element).getAttribute === 'function'
    ) {
      if ((node as Element).getAttribute('target') === '_blank') {
        (node as Element).setAttribute('rel', 'noopener noreferrer');
      }
    }
  });
}

/** Returns sanitized HTML. Empty/whitespace input returns ''. */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html || !html.trim()) return '';
  ensureHooks();
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}
