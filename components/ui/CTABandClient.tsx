'use client';

import Link from 'next/link';
import { ArrowRight, Mail, Phone } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import HalftoneBg from '@/components/motion/HalftoneBg';
import MotionReveal from '@/components/motion/MotionReveal';
import PressAtmosphere from '@/components/motion/PressAtmosphere';

/**
 * Closing contact band — CMYK registration accents + Framer Motion.
 * Contact details are passed in so this stays a client component without
 * fetching settings itself.
 */
export default function CTABandClient({
  eyebrow,
  title,
  lede,
  buttonText,
  buttonHref,
  phone,
  email,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  buttonText: string;
  buttonHref: string;
  phone: string;
  email: string;
}) {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-band text-onband">
      <HalftoneBg grid fade={false} className="opacity-70" />
      <PressAtmosphere intensity="normal" />

      {/* One soft bloom, not two competing ones. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-cyan/10 blur-3xl"
      />

      <div className="container-page relative py-16 md:py-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <MotionReveal className="max-w-2xl">
            <p className="eyebrow flex items-center gap-3 text-cyan">
              <span aria-hidden="true" className="h-px w-10 bg-cyan" />
              {eyebrow}
            </p>
            <h2 className="mt-4 text-lg font-bold leading-snug sm:mt-5 sm:text-xl sm:leading-tight md:text-2xl lg:text-3xl">
              {title}
            </h2>
            {lede && (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-onband/65">
                {lede}
              </p>
            )}
          </MotionReveal>

          <MotionReveal delay={100} className="flex flex-col gap-4">
            <motion.div
              whileHover={reduce ? undefined : { scale: 1.03 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <Link
                href={buttonHref}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan px-7 py-3.5 font-mono text-xs uppercase text-band transition-colors hover:bg-magenta hover:text-white sm:w-auto"
              >
                {buttonText}
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
                />
              </Link>
            </motion.div>

            <div className="flex flex-col gap-2 rounded-xl border border-line bg-band-2/50 px-5 py-4 font-mono text-xs text-onband/55 backdrop-blur-sm">
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-cyan"
              >
                <Phone aria-hidden="true" className="h-3.5 w-3.5 text-cyan" />
                {phone}
              </a>
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-cyan"
              >
                <Mail aria-hidden="true" className="h-3.5 w-3.5 text-cyan" />
                {email}
              </a>
            </div>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
