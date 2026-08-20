import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import HalftoneBg from '@/components/motion/HalftoneBg';
import RegistrationHero from '@/components/motion/RegistrationHero';

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

const links = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'What We Offer' },
  { href: '/media/news', label: 'News' },
  { href: '/contact', label: 'Contact' },
];

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-70px)] items-center overflow-hidden bg-band text-onband">
      <HalftoneBg grid fade={false} className="opacity-60" />

      <div className="container-page relative py-24">
        <p className="eyebrow flex items-center gap-3 text-cyan">
          <span aria-hidden="true" className="h-px w-10 bg-cyan" />
          Error 404
        </p>

        <RegistrationHero
          className="mt-6"
          as="h1"
          textClassName="font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-onband md:text-4xl"
        >
          Out of
          <br />
          register.
        </RegistrationHero>

        <p className="mt-7 max-w-lg text-base leading-relaxed text-onband/65">
          This page is not on the sheet. It may have moved, or the address may be
          mistyped. Pick a route below and carry on.
        </p>

        <ul className="mt-10 flex flex-wrap gap-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group inline-flex items-center gap-2 rounded-sm border border-white/25 px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-onband transition-colors hover:border-cyan hover:text-cyan"
              >
                {l.label}
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
