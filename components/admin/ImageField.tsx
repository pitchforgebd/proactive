'use client';

import { useRef, useState } from 'react';
import { ImageOff, Loader2, Upload, X } from 'lucide-react';

/**
 * Image picker for section `image` fields.
 *
 * Uploads through /api/admin/upload, which stores the file outside the build
 * and returns the /api/files/… URL that gets saved in the section data. The
 * path is also editable by hand, because the seeded content points at
 * /images/… assets in public/ and those must stay usable.
 */
export default function ImageField({
  value,
  onChange,
  describedBy,
}: {
  value: string;
  onChange: (url: string) => void;
  describedBy?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.message ?? 'The upload failed.');
        return;
      }
      onChange(json.url);
    } catch {
      setError('The upload failed. Check your connection and try again.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        {/* Preview. A plain <img> on purpose: the source is arbitrary admin
            input, and next/image would need every possible path configured. */}
        <div className="relative flex h-[74px] w-[110px] shrink-0 items-center justify-center overflow-hidden rounded-md border border-ink/15 bg-ink/[0.04]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <ImageOff aria-hidden="true" className="h-5 w-5 text-graphite/50" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="text"
            value={value}
            aria-describedby={describedBy}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/… or upload a file"
            className="w-full rounded-md border border-ink/20 bg-paper-2 px-3 py-2 font-mono text-xs text-ink outline-none focus:border-cyan"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-md border border-ink/20 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-graphite transition-colors hover:border-cyan hover:text-cyan disabled:opacity-60"
            >
              {busy ? (
                <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload aria-hidden="true" className="h-3.5 w-3.5" />
              )}
              {busy ? 'Uploading' : 'Upload'}
            </button>

            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1.5 rounded-md border border-ink/20 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-graphite transition-colors hover:border-magenta hover:text-magenta"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      {error && (
        <p role="alert" className="text-xs text-magenta">
          {error}
        </p>
      )}
    </div>
  );
}
