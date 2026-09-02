import Link from 'next/link';
import { getCategories, getSiteSettings } from '@/lib/data';
import { buildNav } from '@/lib/nav';
import Logo from '@/components/layout/Logo';
import Nav from '@/components/layout/Nav';
import MobileDrawer from '@/components/layout/MobileDrawer';
import ThemeToggle from '@/components/layout/ThemeToggle';

/**
 * Server component — categories for the Products dropdown and Settings.logo
 * are read here so only the interactive shells (Nav, MobileDrawer) ship JS.
 *
 * Contrast: the bar is an opaque `bg-paper-2` surface (design-token adaptive
 * for light/dark theme). Semi-transparent glass over dark heroes made
 * `text-ink` nav labels unreadable; opacity is intentional, not decorative.
 */
export default async function Header() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);
  const nav = buildNav(categories);
  const logoSrc = settings.logo || undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper-2">
      {/* CMYK registration rule — the site's signature hairline. */}
      <div
        aria-hidden="true"
        className="h-0.5 w-full"
        style={{
          background:
            'linear-gradient(90deg, var(--cyan) 0%, var(--cyan) 33%, var(--magenta) 33%, var(--magenta) 66%, var(--yellow) 66%, var(--yellow) 100%)',
        }}
      />

      <div className="container-page flex h-[70px] items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Proactive Trade International — home"
          className="shrink-0"
        >
          <Logo
            src={logoSrc}
            title={settings.logoTitle}
            subtitle={settings.logoSubtitle}
          />
        </Link>

        <Nav items={nav} />

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />

          <Link
            href="/contact"
            className="hidden rounded-md bg-ink px-5 py-2.5 font-mono text-xs uppercase text-paper transition-colors hover:bg-magenta sm:inline-flex"
          >
            Get in Touch
          </Link>

          <MobileDrawer
            items={nav}
            logoSrc={logoSrc}
            logoTitle={settings.logoTitle}
            logoSubtitle={settings.logoSubtitle}
          />
        </div>
      </div>
    </header>
  );
}
