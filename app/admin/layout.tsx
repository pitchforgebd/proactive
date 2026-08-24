import type { Metadata } from 'next';

/**
 * DASHBOARD SHELL.
 *
 * Utilitarian on purpose (PHASE2-BACKEND.md §7): the same design tokens and
 * fonts as the public site, but tables and forms rather than the marketing
 * look — and no drag-drop canvas anywhere.
 *
 * The login page lives under this layout too, so it deliberately carries no
 * navigation of its own; the sidebar is rendered by app/admin/(dashboard)
 * pages via <AdminShell/> instead.
 */
export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s · Proactive Dashboard',
  },
  // The dashboard must never be indexed.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-paper text-ink">{children}</div>;
}
