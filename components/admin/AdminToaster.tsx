'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastKind = 'success' | 'error';

export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

type Listener = (items: ToastItem[]) => void;

let seq = 0;
let queue: ToastItem[] = [];
const listeners = new Set<Listener>();

function publish() {
  listeners.forEach((listener) => listener(queue));
}

function push(kind: ToastKind, message: string) {
  const text = message.trim();
  if (!text) return;
  const item: ToastItem = { id: ++seq, kind, message: text };
  queue = [...queue, item];
  publish();
  window.setTimeout(() => {
    queue = queue.filter((t) => t.id !== item.id);
    publish();
  }, 3800);
}

/** Show a success toast (green/cyan). */
export function toastSuccess(message: string) {
  push('success', message);
}

/** Show an error toast (magenta). */
export function toastError(message: string) {
  push('error', message);
}

/** Convenience: toast from a `{ ok, message? }` action result. */
export function toastFromResult(
  result: { ok: boolean; message?: string },
  fallbackOk = 'Saved.',
  fallbackErr = 'Something went wrong.',
) {
  if (result.ok) toastSuccess(result.message || fallbackOk);
  else toastError(result.message || fallbackErr);
}

function dismiss(id: number) {
  queue = queue.filter((t) => t.id !== id);
  publish();
}

/**
 * Fixed toast stack for the admin dashboard. Mount once inside AdminShell.
 */
export default function AdminToaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.add(setItems);
    setItems(queue);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(100%-2rem,22rem)] flex-col gap-2"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role={item.kind === 'error' ? 'alert' : 'status'}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-[0_16px_40px_-24px_rgba(14,17,22,0.55)]',
            item.kind === 'success'
              ? 'border-cyan/40 bg-paper-2 text-ink'
              : 'border-magenta/40 bg-paper-2 text-ink',
          )}
        >
          {item.kind === 'success' ? (
            <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
          ) : (
            <X aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-magenta" />
          )}
          <p className="min-w-0 flex-1 leading-snug">{item.message}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismiss(item.id)}
            className="shrink-0 font-mono text-[10px] uppercase text-graphite hover:text-ink"
          >
            Close
          </button>
        </div>
      ))}
    </div>
  );
}
