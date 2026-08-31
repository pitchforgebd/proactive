'use client';

import { useState, useTransition } from 'react';
import { Loader2, Plus } from 'lucide-react';

import { addSection } from '@/app/admin/pages/actions';

export interface SectionTypeOption {
  type: string;
  label: string;
  hint: string;
  group: string;
}

/**
 * "Add section" — the only way to put a new block on a page.
 *
 * The list comes from the code registry, so an editor can add an instance of a
 * section type but can never invent one. That is the guardrail that keeps this
 * a structured CMS rather than a page builder (PHASE2-BACKEND.md §6.2).
 */
export default function AddSection({
  pageSlug,
  groups,
  options,
}: {
  pageSlug: string;
  groups: string[];
  options: SectionTypeOption[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState<string | null>(null);

  function add(type: string) {
    setAdding(type);
    // The action redirects into the new section's editor on success.
    startTransition(() => addSection(pageSlug, type));
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 inline-flex items-center gap-2 rounded-md border border-dashed border-ink/30 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-graphite transition-colors hover:border-cyan hover:text-cyan"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
        Add section
      </button>
    );
  }

  return (
    <section aria-label="Add a section" className="mt-8 rounded-xl border border-ink/15 bg-paper-2 p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold leading-tight">Add a section</h3>
          <p className="mt-1 text-sm text-graphite">
            Each type has a fixed, hand-built design. You choose which one and fill in
            its content.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite transition-colors hover:text-magenta"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-6">
        {groups.map((group) => {
          const inGroup = options.filter((o) => o.group === group);
          if (inGroup.length === 0) return null;

          return (
            <div key={group}>
              <h4 className="font-mono text-[11px] uppercase tracking-[0.14em] text-cyan">
                {group}
              </h4>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {inGroup.map((option) => (
                  <li key={option.type}>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => add(option.type)}
                      className="flex h-full w-full flex-col items-start gap-1 rounded-lg border border-ink/15 p-4 text-left transition-colors hover:border-cyan disabled:opacity-60"
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                        {pending && adding === option.type && (
                          <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin text-cyan" />
                        )}
                        {option.label}
                      </span>
                      <span className="text-xs leading-relaxed text-graphite">
                        {option.hint}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
