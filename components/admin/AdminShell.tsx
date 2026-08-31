import Link from 'next/link';
import {
  Briefcase,
  FileText,
  Handshake,
  Image as ImageIcon,
  Inbox,
  LayoutGrid,
  Layers,
  Newspaper,
  Package,
  Settings as SettingsIcon,
  Users,
  Video,
} from 'lucide-react';

import { signOutAction } from '@/app/admin/actions';
import Logo from '@/components/layout/Logo';

/**
 * Dashboard chrome: sidebar, page title, sign-out.
 *
 * Deliberately plain — tables and forms, not the marketing look. Sections that
 * do not exist yet are listed but disabled, so the shape of the dashboard is
 * visible from the first screen rather than appearing a piece at a time.
 */
const nav: { href: string; label: string; icon: typeof FileText; ready: boolean }[] = [
  { href: '/admin', label: 'Overview', icon: LayoutGrid, ready: true },
  { href: '/admin/pages', label: 'Pages & Sections', icon: Layers, ready: true },
  { href: '/admin/categories', label: 'Categories', icon: Package, ready: true },
  { href: '/admin/products', label: 'Products', icon: Package, ready: true },
  { href: '/admin/news', label: 'News', icon: Newspaper, ready: true },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon, ready: true },
  { href: '/admin/videos', label: 'Videos', icon: Video, ready: true },
  { href: '/admin/partners', label: 'Partners', icon: Handshake, ready: true },
  { href: '/admin/jobs', label: 'Job openings', icon: Briefcase, ready: true },
  { href: '/admin/career', label: 'Applications', icon: Users, ready: true },
  { href: '/admin/contact', label: 'Messages', icon: Inbox, ready: true },
  { href: '/admin/settings', label: 'Settings', icon: SettingsIcon, ready: true },
];

export default function AdminShell({
  title,
  lede,
  user,
  children,
}: {
  title: string;
  lede?: string;
  user: { name?: string | null; email?: string | null };
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Sidebar ---------------------------------------------------------- */}
      <aside className="shrink-0 border-b border-ink/10 bg-paper-2 lg:w-[260px] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-6 py-5 lg:block">
          <Link href="/admin" aria-label="Dashboard home">
            <Logo />
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan lg:mt-3">
            Dashboard
          </p>
        </div>

        <nav aria-label="Dashboard" className="px-3 pb-5">
          <ul className="space-y-0.5">
            {nav.map((item) => {
              const Icon = item.icon;
              const className =
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors';

              return (
                <li key={item.href}>
                  {item.ready ? (
                    <Link
                      href={item.href}
                      className={`${className} text-ink hover:bg-ink/[0.05]`}
                    >
                      <Icon aria-hidden="true" className="h-4 w-4 text-cyan" />
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      title="Not built yet"
                      className={`${className} cursor-default text-graphite/60`}
                    >
                      <Icon aria-hidden="true" className="h-4 w-4 opacity-40" />
                      {item.label}
                      <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.1em] opacity-60">
                        soon
                      </span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto border-t border-ink/10 px-6 py-5">
          <p className="truncate text-sm font-semibold text-ink">
            {user.name || 'Administrator'}
          </p>
          <p className="mt-0.5 truncate font-mono text-xs text-graphite">{user.email}</p>
          <form action={signOutAction} className="mt-4">
            <button
              type="submit"
              className="w-full rounded-md border border-ink/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-graphite transition-colors hover:border-magenta hover:text-magenta"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="mt-3 block text-center font-mono text-[11px] uppercase tracking-[0.14em] text-graphite transition-colors hover:text-cyan"
          >
            View site
          </Link>
        </div>
      </aside>

      {/* Content ---------------------------------------------------------- */}
      <main id="main" className="min-w-0 flex-1 px-6 py-8 md:px-10 md:py-10">
        <header className="mb-8 border-b border-ink/10 pb-6">
          <h1 className="font-display text-2xl font-bold leading-tight">{title}</h1>
          {lede && <p className="mt-2 max-w-2xl text-sm text-graphite">{lede}</p>}
        </header>
        {children}
      </main>
    </div>
  );
}
