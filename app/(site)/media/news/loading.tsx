import Section from '@/components/ui/Section';
import Skeleton, { CardGridSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <>
      <section className="bg-band py-16 md:py-24">
        <div className="container-page">
          <Skeleton className="h-3 w-40 bg-white/10" />
          <Skeleton className="mt-6 h-12 w-full max-w-xl bg-white/10" />
        </div>
      </section>

      <Section tone="paper-2">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Skeleton className="aspect-[16/10] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </Section>

      <Section tone="paper">
        <CardGridSkeleton count={3} />
      </Section>
    </>
  );
}
