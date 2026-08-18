import Link from 'next/link';
import { ArrowRight, Mail, Phone } from 'lucide-react';
import { getSiteSettings } from '@/lib/data';
import HalftoneBg from '@/components/motion/HalftoneBg';

/**
 * Closing contact band. Reused at the foot of every content page so there is
 * always one obvious next step.
 */
export default async function CTABand({
  title = 'Tell us what you print. We will specify the rest.',
  lede = 'Machinery selection, consumable programmes, technical service — talk to our team about your production.',
}: {
  title?: string;
  lede?: string;
}) {
  const settings = await getSiteSettings();

  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <HalftoneBg grid fade={false} className="opacity-70" />

      <div className="container-page relative py-16 md:py-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow flex items-center gap-3 text-cyan">
              <span aria-hidden="true" className="h-px w-10 bg-cyan" />
              Get in Touch
            </p>
            <h2 className="mt-5 text-xl font-bold leading-tight md:text-2xl">
              {title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-paper/65">{lede}</p>
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 rounded-sm bg-cyan px-7 py-3.5 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-magenta hover:text-white"
            >
              Contact Us
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
              />
            </Link>

            <div className="flex flex-col gap-2 font-mono text-xs text-paper/55">
              <a
                href={`tel:${settings.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-cyan"
              >
                <Phone aria-hidden="true" className="h-3.5 w-3.5" />
                {settings.phone}
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-cyan"
              >
                <Mail aria-hidden="true" className="h-3.5 w-3.5" />
                {settings.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
