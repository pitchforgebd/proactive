'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2, Save } from 'lucide-react';

import { saveSection, type ActionResult } from '@/app/admin/pages/actions';
import FieldRenderer from '@/components/admin/FieldRenderer';
import type { FieldDescriptor } from '@/lib/sections/introspect';

/**
 * The section content form, generated from the section type's zod schema.
 *
 * State is a single plain object mirroring the section's `data`, submitted as
 * JSON to a Server Action. Doing it this way rather than as named form inputs
 * means nested arrays (slides, stats, milestones) round-trip without any
 * name-path parsing, and reordering a list is just an array move.
 *
 * The server validates the same schema again — this form's job is to make valid
 * data easy to produce, not to be the thing that guarantees it.
 */
export default function SectionForm({
  pageSlug,
  sectionId,
  typeLabel,
  typeHint,
  fields,
  initialData,
  backHref,
}: {
  pageSlug: string;
  sectionId: string;
  typeLabel: string;
  typeHint: string;
  fields: FieldDescriptor[];
  initialData: Record<string, unknown>;
  backHref: string;
}) {
  const [data, setData] = useState<Record<string, unknown>>(initialData);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = (key: string, value: unknown) => {
    setData((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setResult(null);
  };

  function submit() {
    startTransition(async () => {
      const outcome = await saveSection(pageSlug, sectionId, JSON.stringify(data));
      setResult(outcome);
      if (outcome.ok) setDirty(false);
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-5">
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-graphite transition-colors hover:text-cyan"
          >
            <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
            All sections
          </Link>
          <h2 className="mt-3 font-display text-xl font-bold leading-tight">
            {typeLabel}
          </h2>
          <p className="mt-1.5 max-w-xl text-sm text-graphite">{typeHint}</p>
        </div>

        <SaveButton pending={pending} dirty={dirty} />
      </div>

      {result && (
        <p
          role="status"
          className={`mb-6 flex items-center gap-2 border-l-2 px-4 py-3 text-sm ${
            result.ok
              ? 'border-cyan bg-cyan/5 text-ink'
              : 'border-magenta bg-magenta/5 text-ink'
          }`}
        >
          {result.ok && <Check aria-hidden="true" className="h-4 w-4 text-cyan" />}
          {result.message}
        </p>
      )}

      <div className="max-w-3xl space-y-7">
        {fields.length === 0 && (
          <p className="text-sm text-graphite">
            This section type has no editable fields — its content comes from a
            collection.
          </p>
        )}

        {fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            path={field.name}
            value={data[field.name]}
            error={result?.errors?.[field.name]}
            onChange={(next) => set(field.name, next)}
          />
        ))}
      </div>

      <div className="mt-10 border-t border-ink/10 pt-6">
        <SaveButton pending={pending} dirty={dirty} />
      </div>
    </form>
  );
}

function SaveButton({ pending, dirty }: { pending: boolean; dirty: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {dirty && !pending && (
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-magenta">
          Unsaved changes
        </span>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-sm bg-cyan px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-band transition-colors hover:bg-magenta hover:text-white disabled:opacity-60"
      >
        {pending ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <Save aria-hidden="true" className="h-4 w-4" />
        )}
        {pending ? 'Saving' : 'Save section'}
      </button>
    </div>
  );
}
