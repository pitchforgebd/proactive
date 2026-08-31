import Link from 'next/link';

/**
 * Settings sub-navigation: General | Sitemap
 */
export default function SettingsNav({ active }: { active: 'general' | 'sitemap' }) {
  const item =
    'rounded-md px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors';

  return (
    <nav
      aria-label="Settings sections"
      className="mb-8 flex flex-wrap gap-2 border-b border-ink/10 pb-4"
    >
      <Link
        href="/admin/settings"
        className={`${item} ${
          active === 'general'
            ? 'bg-ink text-paper-2'
            : 'text-graphite hover:bg-ink/[0.05] hover:text-ink'
        }`}
      >
        General
      </Link>
      <Link
        href="/admin/settings/sitemap"
        className={`${item} ${
          active === 'sitemap'
            ? 'bg-ink text-paper-2'
            : 'text-graphite hover:bg-ink/[0.05] hover:text-ink'
        }`}
      >
        Sitemap
      </Link>
    </nav>
  );
}
