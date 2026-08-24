'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react';

import {
  deleteSection,
  reorderSections,
  setSectionVisible,
} from '@/app/admin/pages/actions';

export interface SectionRowView {
  id: string;
  type: string;
  typeLabel: string;
  /** First meaningful string in the section's data — helps identify the row. */
  preview: string;
  visible: boolean;
  known: boolean;
}

/**
 * The ordered section list for one page.
 *
 * Reordering works two ways on purpose: drag for speed, and up/down buttons so
 * it is usable from the keyboard and on touch. The new order is applied
 * optimistically and persisted as the full id sequence.
 */
export default function SectionList({
  pageSlug,
  sections,
}: {
  pageSlug: string;
  sections: SectionRowView[];
}) {
  const [rows, setRows] = useState(sections);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function persist(next: SectionRowView[]) {
    setRows(next);
    setError(null);
    startTransition(async () => {
      const outcome = await reorderSections(
        pageSlug,
        next.map((r) => r.id),
      );
      if (outcome && !outcome.ok) {
        setError(outcome.message ?? 'The new order could not be saved.');
      }
    });
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= rows.length || from === to) return;
    const next = [...rows];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    persist(next);
  }

  function toggle(row: SectionRowView) {
    const next = rows.map((r) =>
      r.id === row.id ? { ...r, visible: !r.visible } : r,
    );
    setRows(next);
    startTransition(() => setSectionVisible(pageSlug, row.id, !row.visible));
  }

  function remove(row: SectionRowView) {
    const confirmed = window.confirm(
      `Delete the "${row.typeLabel}" section? This cannot be undone.`,
    );
    if (!confirmed) return;
    setRows(rows.filter((r) => r.id !== row.id));
    startTransition(() => deleteSection(pageSlug, row.id));
  }

  if (rows.length === 0) {
    return (
      <p className="border border-dashed border-ink/25 px-6 py-10 text-center text-sm text-graphite">
        This page has no sections yet. Add one below and it will appear on the live
        page as soon as you save it.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          {rows.length} section{rows.length === 1 ? '' : 's'} · drag or use the arrows
          to reorder
        </p>
        {pending && (
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-cyan">
            <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
            Saving
          </span>
        )}
      </div>

      {error && (
        <p role="alert" className="mb-3 border-l-2 border-magenta bg-magenta/5 px-4 py-3 text-sm">
          {error}
        </p>
      )}

      <ul className="space-y-2">
        {rows.map((row, index) => (
          <li
            key={row.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragEnter={() => setOverIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={() => {
              if (dragIndex !== null && overIndex !== null) move(dragIndex, overIndex);
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={[
              'flex items-center gap-4 rounded-sm border bg-paper-2 px-4 py-3 transition-colors',
              overIndex === index && dragIndex !== null
                ? 'border-cyan'
                : 'border-ink/15',
              row.visible ? '' : 'opacity-60',
            ].join(' ')}
          >
            <GripVertical
              aria-hidden="true"
              className="h-4 w-4 shrink-0 cursor-grab text-graphite/50"
            />

            <span className="w-7 shrink-0 font-mono text-[11px] text-graphite">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                {row.typeLabel}
                {!row.known && (
                  <span className="rounded-sm bg-magenta/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-magenta">
                    unknown type — not rendered
                  </span>
                )}
                {!row.visible && (
                  <span className="rounded-sm bg-ink/[0.07] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-graphite">
                    hidden
                  </span>
                )}
              </p>
              {row.preview && (
                <p className="mt-0.5 truncate text-xs text-graphite">{row.preview}</p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Action
                label={`Move ${row.typeLabel} up`}
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
              >
                <ChevronUp aria-hidden="true" className="h-4 w-4" />
              </Action>
              <Action
                label={`Move ${row.typeLabel} down`}
                disabled={index === rows.length - 1}
                onClick={() => move(index, index + 1)}
              >
                <ChevronDown aria-hidden="true" className="h-4 w-4" />
              </Action>
              <Action
                label={row.visible ? `Hide ${row.typeLabel}` : `Show ${row.typeLabel}`}
                onClick={() => toggle(row)}
              >
                {row.visible ? (
                  <Eye aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <EyeOff aria-hidden="true" className="h-4 w-4" />
                )}
              </Action>

              {row.known && (
                <Link
                  href={`/admin/pages/${pageSlug}/sections/${row.id}`}
                  aria-label={`Edit ${row.typeLabel}`}
                  title="Edit"
                  className="rounded-sm border border-ink/15 p-1.5 text-graphite transition-colors hover:border-cyan hover:text-cyan"
                >
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                </Link>
              )}

              <Action label={`Delete ${row.typeLabel}`} danger onClick={() => remove(row)}>
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </Action>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Action({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded-sm border border-ink/15 p-1.5 text-graphite transition-colors disabled:opacity-30 ${
        danger
          ? 'hover:border-magenta hover:text-magenta'
          : 'hover:border-cyan hover:text-cyan'
      }`}
    >
      {children}
    </button>
  );
}
