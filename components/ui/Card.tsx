'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardProps {
  href: string;
  title: string;
  image: string;
  description?: string;
  eyebrow?: string;
  sizes?: string;
  priority?: boolean;
  aspect?: 'video' | 'square' | 'portrait';
  className?: string;
}

const aspectClass = {
  video: 'aspect-[16/10]',
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
};

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Content card with Framer hover lift + registration crosshair.
 */
export default function Card({
  href,
  title,
  image,
  description,
  eyebrow,
  sizes = '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw',
  priority = false,
  aspect = 'video',
  className,
}: CardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn('h-full', className)}
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ duration: 0.35, ease }}
    >
      <Link
        href={href}
        className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-ink/10 bg-paper-2 shadow-[0_1px_0_rgba(14,17,22,0.04)] transition-colors duration-300 hover:border-cyan/35 hover:shadow-[0_18px_40px_-28px_rgba(14,17,22,0.45)]"
      >
        <div className={cn('relative overflow-hidden bg-band-2', aspectClass[aspect])}>
          <Image
            src={image}
            alt={title}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-700 ease-press group-hover:scale-[1.06]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-band/50 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3 h-5 w-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cyan" />
            <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-magenta" />
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3.5 sm:gap-2 sm:p-5">
          {eyebrow && <span className="eyebrow text-[10px] text-graphite sm:text-xs">{eyebrow}</span>}
          <h3 className="relative inline-flex items-start gap-1.5 text-sm font-semibold leading-snug sm:text-lg">
            <span>
              {title}
              <span
                aria-hidden="true"
                className="mt-1 block h-px w-0 bg-magenta transition-[width] duration-300 ease-press group-hover:w-full"
              />
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="mt-1 h-4 w-4 shrink-0 text-graphite transition-colors group-hover:text-magenta"
            />
          </h3>
          {description && (
            <p className="text-xs text-graphite line-clamp-3 sm:text-sm">{description}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
