'use client';

import dynamic from 'next/dynamic';
import type { JobOpening } from '@/lib/types';
import Skeleton from '@/components/ui/Skeleton';

/**
 * Client-side lazy boundaries for the two forms (CLAUDE.md §5.5).
 *
 * WHY THIS EXISTS
 * The section renderer can render any section type, so react-hook-form + zod +
 * the resolvers were landing in the first-load bundle of every section-driven
 * page — measured at ~31 kB on nine pages that contain no form at all. A
 * dynamic import inside a Server Component does not fix that: Next collects
 * client references from the whole module graph, async chunks included. The
 * boundary has to be a Client Component, which is what this file is.
 *
 * `ssr: false` costs nothing real here — both forms submit with fetch, so they
 * already required JavaScript to do anything. The skeletons reserve the form's
 * height so the swap-in causes no layout shift (§5.8).
 */

function FormSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-[46px] w-full" />
        </div>
      ))}
      <Skeleton className="h-[46px] w-44" />
    </div>
  );
}

export const LazyContactForm = dynamic(
  () => import('@/components/forms/ContactForm'),
  { ssr: false, loading: () => <FormSkeleton rows={5} /> },
);

const CareerFormInner = dynamic(() => import('@/components/forms/CareerForm'), {
  ssr: false,
  loading: () => <FormSkeleton rows={6} />,
});

export function LazyCareerForm({ openings }: { openings: JobOpening[] }) {
  return <CareerFormInner openings={openings} />;
}
