'use client';

import { useState, useTransition } from 'react';
import { Check, Loader2, Save } from 'lucide-react';

import { savePageSeo, type ActionResult } from '@/app/admin/pages/actions';
import ImageField from '@/components/admin/ImageField';

const control =
  'w-full rounded-md border border-ink/20 bg-paper-2 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-cyan focus:ring-2 focus:ring-cyan/25';

const label = 'font-mono text-[11px] uppercase tracking-[0.14em] text-graphite';

/** Page title, meta description and OG image. Counters flag over-long values. */
export default function SeoForm({
  pageSlug,
  initial,
}: {
  pageSlug: string;
  initial: { title: string; seoTitle: string; seoDescription: string; ogImage: string };
}) {
  const [title, setTitle] = useState(initial.title);
  const [ogImage, setOgImage] = useState(initial.ogImage);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () =>
          setResult(
            await savePageSeo(
              pageSlug,
              JSON.stringify({ title, seoTitle, seoDescription, ogImage }),
            ),
          ),
        );
      }}
      className="max-w-2xl space-y-7"
    >
      {result && (
        <p
          role="status"
          className={`flex items-center gap-2 border-l-2 px-4 py-3 text-sm ${
            result.ok ? 'border-cyan bg-cyan/5' : 'border-magenta bg-magenta/5'
          }`}
        >
          {result.ok && <Check aria-hidden="true" className="h-4 w-4 text-cyan" />}
          {result.message}
        </p>
      )}

      <div>
        <label htmlFor="title" className={label}>
          Page name
        </label>
        <p className="mt-1 text-xs text-graphite">
          Internal — what this page is called in the dashboard.
        </p>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={`${control} mt-2`}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="seoTitle" className={label}>
            Search title
          </label>
          <Counter value={seoTitle.length} limit={60} />
        </div>
        <input
          id="seoTitle"
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          className={`${control} mt-2`}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="seoDescription" className={label}>
            Search description
          </label>
          <Counter value={seoDescription.length} limit={160} />
        </div>
        <textarea
          id="seoDescription"
          rows={3}
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          className={`${control} mt-2`}
        />
      </div>

      <div>
        <p className={label}>Social share image</p>
        <p className="mt-1 text-xs text-graphite">
          Shown when the page is shared. 1200×630 works everywhere.
        </p>
        <div className="mt-2">
          <ImageField value={ogImage} onChange={setOgImage} />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-band transition-colors hover:bg-magenta hover:text-white disabled:opacity-60"
      >
        {pending ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <Save aria-hidden="true" className="h-4 w-4" />
        )}
        {pending ? 'Saving' : 'Save SEO'}
      </button>
    </form>
  );
}

/** Search engines truncate past these lengths — warn rather than block. */
function Counter({ value, limit }: { value: number; limit: number }) {
  const over = value > limit;
  return (
    <span
      className={`font-mono text-[11px] ${over ? 'text-magenta' : 'text-graphite/70'}`}
    >
      {value}/{limit}
      {over && ' — may be truncated'}
    </span>
  );
}
