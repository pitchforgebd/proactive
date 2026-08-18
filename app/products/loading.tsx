import Section from '@/components/ui/Section';
import Skeleton, { CardGridSkeleton } from '@/components/ui/Skeleton';

/** Reserves the real page rhythm so the swap-in causes no layout shift. */
export default function Loading() {
  return (
    <>
      <section className="bg-ink py-16 md:py-24">
        <div className="container-page">
          <Skeleton className="h-3 w-48 bg-white/10" />
          <Skeleton className="mt-6 h-12 w-full max-w-2xl bg-white/10" />
          <Skeleton className="mt-5 h-4 w-full max-w-xl bg-white/10" />
        </div>
      </section>

      <Section tone="paper">
        <CardGridSkeleton count={4} />
      </Section>
    </>
  );
}
