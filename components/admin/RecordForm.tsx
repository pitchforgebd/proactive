'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';

import { deleteRecord, saveRecord, type CrudResult } from '@/lib/admin/collection-actions';
import FieldRenderer from '@/components/admin/FieldRenderer';
import { toastError, toastFromResult, toastSuccess } from '@/components/admin/AdminToaster';
import { slugify } from '@/lib/collections';
import type { FieldDescriptor } from '@/lib/sections/introspect';

/**
 * Create/edit form for any collection record.
 *
 * Shares <FieldRenderer/> with the section editor, so a text input, an image
 * uploader, Summernote and a repeatable group all behave identically whether
 * you are editing a page section or a product.
 */
export default function RecordForm({
  collection,
  singular,
  recordId,
  fields,
  initial,
  backHref,
  slugFrom,
}: {
  collection: string;
  singular: string;
  /** null when creating. */
  recordId: string | null;
  fields: FieldDescriptor[];
  initial: Record<string, unknown>;
  backHref: string;
  slugFrom?: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown>>(initial);
  const [result, setResult] = useState<CrudResult | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();

  function set(key: string, value: unknown) {
    setData((current) => {
      const next = { ...current, [key]: value };
      // Creating a record: keep the slug in step with the name until someone
      // edits the slug by hand. Existing slugs are never rewritten — that would
      // silently break a live URL.
      if (
        !recordId &&
        slugFrom &&
        key === slugFrom &&
        typeof value === 'string' &&
        (!current.slug || current.slug === slugify(String(current[slugFrom] ?? '')))
      ) {
        next.slug = slugify(value);
      }
      return next;
    });
    setDirty(true);
    setResult(null);
  }

  function submit() {
    startTransition(async () => {
      const outcome = await saveRecord(collection, recordId, JSON.stringify(data));
      setResult(outcome);
      toastFromResult(
        outcome,
        recordId ? `${singular} saved.` : `${singular} created.`,
      );
      if (outcome.ok) {
        setDirty(false);
        if (!recordId && outcome.id) router.replace(`/admin/${collection}/${outcome.id}`);
        else router.refresh();
      }
    });
  }

  function remove() {
    if (!recordId) return;
    if (!window.confirm(`Delete this ${singular}? This cannot be undone.`)) return;
    startTransition(async () => {
      const outcome = await deleteRecord(collection, recordId);
      if (outcome.ok) {
        toastSuccess(`${singular} deleted.`);
        router.push(backHref);
      } else {
        setResult(outcome);
        toastError(outcome.message || `Could not delete this ${singular}.`);
      }
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
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-graphite transition-colors hover:text-cyan"
        >
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
          Back
        </Link>

        <div className="flex items-center gap-3">
          {dirty && !pending && (
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-magenta">
              Unsaved changes
            </span>
          )}
          {recordId && (
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-md border border-ink/20 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-graphite transition-colors hover:border-magenta hover:text-magenta disabled:opacity-60"
            >
              <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
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
            {pending ? 'Saving' : recordId ? 'Save' : `Create ${singular}`}
          </button>
        </div>
      </div>

      {result?.message && !result.ok && (
        <p
          role="alert"
          className="mb-6 flex items-center gap-2 border-l-2 border-magenta bg-magenta/5 px-4 py-3 text-sm"
        >
          {result.message}
        </p>
      )}

      <div className="max-w-3xl space-y-7">
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
    </form>
  );
}
