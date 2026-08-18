import Link from 'next/link';
import { Phone } from 'lucide-react';
import { getCategories, getSiteSettings } from '@/lib/data';
import { buildNav } from '@/lib/nav';
import Logo from '@/components/layout/Logo';
import Nav from '@/components/layout/Nav';
import MobileDrawer from '@/components/layout/MobileDrawer';

/**
 * Server component — the category list for the "What We Offer" dropdown is read
 * here, so only the interactive shells (Nav, MobileDrawer) ship JavaScript.
 */
export default async function Header() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);
  const nav = buildNav(categories);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper-2/90 backdrop-blur-md">
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
        <Link href="/" aria-label="Proactive Trade International — home">
          <Logo />
        </Link>

        <Nav items={nav} />

        <div className="flex items-center gap-2">
          <a
            href={`tel:${settings.phone.replace(/\s/g, '')}`}
            className="hidden items-center gap-2 px-3 py-2 font-mono text-xs tracking-[0.08em] text-graphite transition-colors hover:text-cyan lg:flex"
          >
            <Phone aria-hidden="true" className="h-3.5 w-3.5" />
            {settings.phone}
          </a>

          <Link
            href="/contact"
            className="hidden rounded-sm bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-paper transition-colors hover:bg-magenta sm:inline-flex"
          >
            Get in Touch
          </Link>

          <MobileDrawer items={nav} />
        </div>
      </div>
    </header>
  );
}
