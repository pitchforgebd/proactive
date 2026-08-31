'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type Tag = 'div' | 'li' | 'article' | 'section' | 'dl' | 'ul';

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Framer Motion scroll reveal — once per element, reduced-motion safe.
 * Prefer this for interactive/eye-catchy sections; keep CSS `RevealOnView`
 * for dense lists where a lighter footprint matters.
 */
export default function MotionReveal({
  children,
  delay = 0,
  className,
  as = 'div',
  y = 22,
  ...rest
}: {
  children: React.ReactNode;
  /** Stagger in ms. */
  delay?: number;
  className?: string;
  as?: Tag;
  y?: number;
} & Omit<HTMLMotionProps<'div'>, 'children' | 'className'>) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;

  return (
    <Comp
      className={cn(className)}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.55, delay: delay / 1000, ease }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
