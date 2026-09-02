'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Mail, MailOpen, Trash2 } from 'lucide-react';

import { deleteSubmission, markRead } from '@/lib/admin/site-actions';
import { toastError, toastSuccess } from '@/components/admin/AdminToaster';
import { formatDate } from '@/lib/utils';

export interface InboxEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** Subject line, or the position applied for. */
  heading: string;
  body: string;
  /** Career applications only. */
  resumeUrl?: string;
  read: boolean;
  createdAt: string;
}

/**
 * Shared inbox for career applications and contact messages.
 *
 * Rows expand in place rather than opening a detail route — an inbox is for
 * scanning, and a message body is short enough to read without a page load.
 */
export default function Inbox({
  kind,
  entries,
}: {
  kind: 'career' | 'contact';
  entries: InboxEntry[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink/25 px-6 py-12 text-center text-sm text-graphite">
        Nothing here yet. Submissions from the website appear in this list as they
        arrive.
      </p>
    );
  }

  function toggle(entry: InboxEntry) {
    const next = open === entry.id ? null : entry.id;
    setOpen(next);
    // Opening an unread item marks it read — that is what opening it means.
    if (next && !entry.read) {
      startTransition(async () => {
        await markRead(kind, entry.id, true);
        router.refresh();
      });
    }
  }

  const unread = entries.filter((e) => !e.read).length;

  return (
    <div>
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
        {entries.length} total · {unread} unread
      </p>

      <ul className="grid gap-px overflow-hidden rounded-xl border border-ink/10 bg-ink/10">
        {entries.map((entry) => {
          const expanded = open === entry.id;
          return (
            <li key={entry.id} className="bg-paper-2">
              <button
                type="button"
                onClick={() => toggle(entry)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-ink/[0.03]"
              >
                {entry.read ? (
                  <MailOpen aria-hidden="true" className="h-4 w-4 shrink-0 text-graphite/50" />
                ) : (
                  <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-cyan" />
                )}
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-sm ${
                      entry.read ? 'text-ink' : 'font-semibold text-ink'
                    }`}
                  >
                    {entry.name}
                    <span className="ml-2 font-normal text-graphite">{entry.heading}</span>
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-xs text-graphite">
                    {entry.email}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-xs text-graphite">
                  {formatDate(entry.createdAt)}
                </span>
              </button>

              {expanded && (
                <div className="border-t border-ink/10 px-4 pb-5 pt-4">
                  <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                    <Detail label="Email">
                      <a href={`mailto:${entry.email}`} className="text-cyan hover:underline">
                        {entry.email}
                      </a>
                    </Detail>
                    {entry.phone && (
                      <Detail label="Phone">
                        <a
                          href={`tel:${entry.phone.replace(/\s/g, '')}`}
                          className="text-cyan hover:underline"
                        >
                          {entry.phone}
                        </a>
                      </Detail>
                    )}
                  </dl>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                    {entry.body}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {entry.resumeUrl && (
                      <a
                        href={entry.resumeUrl}
                        className="inline-flex items-center gap-2 rounded-md border border-ink/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-graphite transition-colors hover:border-cyan hover:text-cyan"
                      >
                        <Download aria-hidden="true" className="h-3.5 w-3.5" />
                        Download CV
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        startTransition(async () => {
                          try {
                            await markRead(kind, entry.id, !entry.read);
                            toastSuccess(
                              entry.read ? 'Marked unread.' : 'Marked read.',
                            );
                            router.refresh();
                          } catch {
                            toastError('Could not update status.');
                          }
                        })
                      }
                      className="rounded-md border border-ink/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-graphite transition-colors hover:border-cyan hover:text-cyan"
                    >
                      Mark {entry.read ? 'unread' : 'read'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!window.confirm('Delete this submission permanently?')) return;
                        startTransition(async () => {
                          try {
                            await deleteSubmission(kind, entry.id);
                            toastSuccess('Submission deleted.');
                            router.refresh();
                          } catch {
                            toastError('Could not delete submission.');
                          }
                        });
                      }}
                      className="inline-flex items-center gap-2 rounded-md border border-ink/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-graphite transition-colors hover:border-magenta hover:text-magenta"
                    >
                      <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}
