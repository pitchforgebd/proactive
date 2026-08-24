'use client';

import { useState, useTransition } from 'react';
import { Check, Loader2, Save } from 'lucide-react';

import { saveSettings, type SettingsResult } from '@/lib/admin/site-actions';

type Values = Record<string, string>;

const control =
  'w-full rounded-sm border border-ink/20 bg-paper-2 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-cyan focus:ring-2 focus:ring-cyan/25';

const fields: { name: string; label: string; hint?: string; type?: string }[] = [
  { name: 'companyName', label: 'Company name' },
  { name: 'phone', label: 'Phone', hint: 'Shown in the footer and every CTA band.' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'address', label: 'Address' },
  {
    name: 'mapQuery',
    label: 'Map location',
    hint: 'What the lazy-loaded map searches for on the contact page.',
  },
];

const socials = [
  { name: 'facebook', label: 'Facebook' },
  { name: 'linkedin', label: 'LinkedIn' },
  { name: 'instagram', label: 'Instagram' },
  { name: 'youtube', label: 'YouTube' },
];

/** An empty social URL removes that link rather than rendering a dead one. */
export default function SettingsForm({ initial }: { initial: Values }) {
  const [values, setValues] = useState<Values>(initial);
  const [result, setResult] = useState<SettingsResult | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setResult(null);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => setResult(await saveSettings(JSON.stringify(values))));
      }}
      className="max-w-2xl space-y-7"
    >
      {result?.message && (
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

      {fields.map((field) => (
        <Row
          key={field.name}
          {...field}
          value={values[field.name] ?? ''}
          onChange={set}
          error={result?.errors?.[field.name]}
        />
      ))}

      <fieldset>
        <legend className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          Social links
        </legend>
        <p className="mt-1 text-xs text-graphite">
          Leave one empty to remove it from the site.
        </p>
        <div className="mt-4 space-y-5">
          {socials.map((field) => (
            <Row
              key={field.name}
              {...field}
              value={values[field.name] ?? ''}
              onChange={set}
              error={result?.errors?.[field.name]}
            />
          ))}
        </div>
      </fieldset>

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
        {pending ? 'Saving' : 'Save settings'}
      </button>
    </form>
  );
}

function Row({
  name,
  label,
  hint,
  type = 'text',
  value,
  onChange,
  error,
}: {
  name: string;
  label: string;
  hint?: string;
  type?: string;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite"
      >
        {label}
      </label>
      {hint && <p className="mt-1 text-xs text-graphite">{hint}</p>}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${control} mt-2`}
      />
      {error && (
        <p id={`${name}-error`} role="alert" className="mt-1.5 text-xs text-magenta">
          {error}
        </p>
      )}
    </div>
  );
}
