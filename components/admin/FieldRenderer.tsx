'use client';

import dynamic from 'next/dynamic';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

import ImageField from '@/components/admin/ImageField';
import type { FieldDescriptor } from '@/lib/sections/introspect';
import { iconNames } from '@/lib/sections/icons';

/** Summernote drags in jQuery — load it only when a field actually needs it. */
const Summernote = dynamic(() => import('@/components/admin/Summernote'), {
  ssr: false,
  loading: () => (
    <div className="h-[260px] animate-pulse rounded-sm border border-ink/10 bg-ink/[0.04]" />
  ),
});

const control =
  'w-full rounded-sm border border-ink/20 bg-paper-2 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-cyan focus:ring-2 focus:ring-cyan/25';

/**
 * Renders one field from its schema descriptor. Recursive: `objectList` renders
 * a repeatable group of these.
 *
 * The editor never lets an admin author markup or layout — the controls
 * available here are exactly the ones the section's zod schema declares.
 */
export default function FieldRenderer({
  field,
  value,
  onChange,
  error,
  path,
}: {
  field: FieldDescriptor;
  value: unknown;
  onChange: (next: unknown) => void;
  error?: string;
  path: string;
}) {
  const id = `f-${path.replace(/\W+/g, '-')}`;
  const errorId = error ? `${id}-error` : undefined;

  const labelRow = (
    <div className="flex items-baseline justify-between gap-3">
      <label
        htmlFor={id}
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite"
      >
        {field.label}
        {!field.required && <span className="ml-2 normal-case opacity-60">optional</span>}
      </label>
    </div>
  );

  const errorNote = error && (
    <p id={errorId} role="alert" className="mt-1.5 text-xs text-magenta">
      {error}
    </p>
  );

  switch (field.kind) {
    case 'html':
      return (
        <div>
          {labelRow}
          <div className="mt-2">
            <Summernote
              value={typeof value === 'string' ? value : ''}
              onChange={(html) => onChange(html)}
            />
          </div>
          {errorNote}
        </div>
      );

    case 'image':
      return (
        <div>
          {labelRow}
          <div className="mt-2">
            <ImageField
              value={typeof value === 'string' ? value : ''}
              onChange={onChange}
              describedBy={errorId}
            />
          </div>
          {errorNote}
        </div>
      );

    case 'textarea':
      return (
        <div>
          {labelRow}
          <textarea
            id={id}
            rows={4}
            value={typeof value === 'string' ? value : ''}
            aria-describedby={errorId}
            onChange={(e) => onChange(e.target.value)}
            className={`${control} mt-2`}
          />
          {errorNote}
        </div>
      );

    case 'boolean':
      return (
        <div>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              id={id}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 accent-[var(--cyan)]"
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
              {field.label}
            </span>
          </label>
          {errorNote}
        </div>
      );

    case 'number':
      return (
        <div>
          {labelRow}
          <input
            id={id}
            type="number"
            value={typeof value === 'number' ? value : 0}
            aria-describedby={errorId}
            onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
            className={`${control} mt-2 max-w-[160px]`}
          />
          {errorNote}
        </div>
      );

    case 'select':
      return (
        <div>
          {labelRow}
          <select
            id={id}
            value={typeof value === 'string' ? value : (field.options?.[0] ?? '')}
            aria-describedby={errorId}
            onChange={(e) => onChange(e.target.value)}
            className={`${control} mt-2 max-w-[260px]`}
          >
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errorNote}
        </div>
      );

    case 'icon':
      return (
        <div>
          {labelRow}
          <select
            id={id}
            value={typeof value === 'string' ? value : ''}
            aria-describedby={errorId}
            onChange={(e) => onChange(e.target.value)}
            className={`${control} mt-2 max-w-[260px]`}
          >
            <option value="">— none —</option>
            {iconNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {errorNote}
        </div>
      );

    case 'stringList':
      return (
        <ListField
          field={field}
          items={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
          renderRow={(item, setItem) => (
            <input
              type="text"
              value={typeof item === 'string' ? item : ''}
              onChange={(e) => setItem(e.target.value)}
              className={control}
            />
          )}
          blank=""
        />
      );

    case 'objectList':
      return (
        <ListField
          field={field}
          items={Array.isArray(value) ? (value as Record<string, unknown>[]) : []}
          onChange={onChange}
          blank={field.itemDefault ?? {}}
          renderRow={(item, setItem, index) => (
            <div className="space-y-4">
              {field.fields?.map((sub) => (
                <FieldRenderer
                  key={sub.name}
                  field={sub}
                  path={`${path}.${index}.${sub.name}`}
                  value={(item as Record<string, unknown>)?.[sub.name]}
                  onChange={(next) =>
                    setItem({ ...(item as Record<string, unknown>), [sub.name]: next })
                  }
                />
              ))}
            </div>
          )}
        />
      );

    case 'href':
    case 'text':
    default:
      return (
        <div>
          {labelRow}
          <input
            id={id}
            type="text"
            value={typeof value === 'string' ? value : ''}
            aria-describedby={errorId}
            placeholder={field.kind === 'href' ? '/products' : undefined}
            onChange={(e) => onChange(e.target.value)}
            className={`${control} mt-2`}
          />
          {errorNote}
        </div>
      );
  }
}

/**
 * Repeatable group: add, remove, move up/down.
 *
 * Reordering is buttons rather than drag: these rows can contain a rich-text
 * editor, and dragging a container that holds a focused editor is a reliable
 * way to lose what someone just typed. Buttons are also keyboard-accessible
 * without extra work.
 */
function ListField<T>({
  field,
  items,
  onChange,
  renderRow,
  blank,
}: {
  field: FieldDescriptor;
  items: T[];
  onChange: (next: T[]) => void;
  renderRow: (item: T, setItem: (next: T) => void, index: number) => React.ReactNode;
  blank: unknown;
}) {
  const update = (next: T[]) => onChange(next);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    update(next);
  };

  return (
    <fieldset>
      <legend className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
        {field.label}
        <span className="ml-2 normal-case opacity-60">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </legend>

      <ul className="mt-3 space-y-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="rounded-sm border border-ink/15 bg-paper-2 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-graphite">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-1">
                <IconButton
                  label={`Move ${field.label} ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ChevronUp aria-hidden="true" className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label={`Move ${field.label} ${index + 1} down`}
                  disabled={index === items.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ChevronDown aria-hidden="true" className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label={`Remove ${field.label} ${index + 1}`}
                  danger
                  onClick={() => update(items.filter((_, i) => i !== index))}
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </IconButton>
              </div>
            </div>

            {renderRow(
              item,
              (next) => update(items.map((row, i) => (i === index ? next : row))),
              index,
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => update([...items, structuredClone(blank) as T])}
        className="mt-3 inline-flex items-center gap-2 rounded-sm border border-dashed border-ink/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-graphite transition-colors hover:border-cyan hover:text-cyan"
      >
        <Plus aria-hidden="true" className="h-3.5 w-3.5" />
        Add {field.label.replace(/s$/, '')}
      </button>
    </fieldset>
  );
}

function IconButton({
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
        danger ? 'hover:border-magenta hover:text-magenta' : 'hover:border-cyan hover:text-cyan'
      }`}
    >
      {children}
    </button>
  );
}
