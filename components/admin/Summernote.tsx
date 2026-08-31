'use client';

import { useEffect, useId, useRef, useState } from 'react';

/**
 * Summernote rich-text editor (PHASE2-BACKEND.md §1 — the client asked for it).
 *
 * jQuery and Summernote are loaded with a dynamic import inside this component,
 * so they exist ONLY in the dashboard's chunk. CLAUDE.md §1 bans jQuery from the
 * site, and this keeps that true: nothing under (site) imports this file, so no
 * public page ever downloads either library.
 *
 * Output is HTML, sanitized server-side before it is stored and again by
 * <RichText/> when it renders.
 */
export default function Summernote({
  value,
  onChange,
  minHeight = 260,
}: {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}) {
  const id = useId().replace(/:/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // Keep the latest handler without re-initialising the editor.
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;
    let $el: any;

    (async () => {
      try {
        const jqueryModule = await import('jquery');
        const jQuery = (jqueryModule.default ?? jqueryModule) as any;

        // Summernote registers itself as a jQuery plugin off the global.
        (window as any).jQuery = jQuery;
        (window as any).$ = jQuery;

        await import('summernote/dist/summernote-lite.css' as string);
        await import('summernote/dist/summernote-lite.js' as string);

        if (cancelled || !ref.current) return;

        $el = jQuery(ref.current);
        $el.summernote({
          placeholder: 'Write the content for this block…',
          height: minHeight,
          disableDragAndDrop: true,
          toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['insert', ['link']],
            ['view', ['codeview', 'undo', 'redo']],
          ],
          // Headings and lists only — no font pickers, no colour pickers, no
          // inline styles. The design lives in code; this writes content.
          styleTags: ['p', 'h2', 'h3', 'blockquote'],
          callbacks: {
            onChange: (contents: string) => onChangeRef.current(contents),
            onBlur: () => onChangeRef.current($el.summernote('code')),
          },
        });

        $el.summernote('code', value || '');
        setReady(true);
      } catch (error) {
        console.error('[summernote] failed to load', error);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      try {
        if ($el?.summernote) $el.summernote('destroy');
      } catch {
        /* editor was never initialised */
      }
    };
    // Initialise once: `value` is the starting content, not a controlled prop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the editor cannot load, fall back to a plain textarea rather than
  // leaving the admin with no way to edit the field at all.
  if (failed) {
    return (
      <div>
        <p className="mb-2 text-xs text-magenta">
          The rich-text editor failed to load. Editing raw HTML instead.
        </p>
        <textarea
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          className="w-full rounded-md border border-ink/20 bg-paper-2 px-3 py-2 font-mono text-xs text-ink outline-none focus:border-cyan"
        />
      </div>
    );
  }

  return (
    <div className="summernote-host">
      {!ready && (
        <div
          style={{ height: minHeight }}
          className="animate-pulse rounded-md border border-ink/10 bg-ink/[0.04]"
        />
      )}
      <div id={id} ref={ref} hidden={!ready} />
    </div>
  );
}
