import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
  const logoDarkSrc = settings.logoDark || undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper-2 shadow-[0_1px_0_rgb(var(--ink-rgb)/0.04)]">
      {/* Registration rule — the site's signature hairline, sky into navy. */}
      <div
        aria-hidden="true"
        className="h-0.5 w-full"
        style={{
          background:
            'linear-gradient(90deg, var(--cyan) 0%, var(--magenta) 55%, var(--cyan) 100%)',
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
            srcDark={logoDarkSrc}
            title={settings.logoTitle}
            subtitle={settings.logoSubtitle}
          />
        </Link>

        <Nav items={nav} />

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />

          <Link
            href="/contact"
            className="group hidden items-center gap-2 rounded-lg bg-magenta px-5 py-2.5 font-mono text-xs uppercase text-white shadow-[0_10px_24px_-14px_rgb(var(--magenta-rgb)/0.9)] transition-all duration-300 ease-press hover:bg-cyan hover:text-band hover:shadow-[0_12px_26px_-12px_rgb(var(--cyan-rgb)/0.8)] sm:inline-flex"
          >
            Get in Touch
            <ArrowRight
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform duration-300 ease-press group-hover:translate-x-0.5"
            />
          </Link>

          <MobileDrawer
            items={nav}
            logoSrc={logoSrc}
            logoDarkSrc={logoDarkSrc}
            logoTitle={settings.logoTitle}
            logoSubtitle={settings.logoSubtitle}
          />
        </div>
      </div>
    </header>
  );
}
