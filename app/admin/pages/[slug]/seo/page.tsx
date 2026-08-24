import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { eq } from 'drizzle-orm';

import { auth } from '@/auth';
import AdminShell from '@/components/admin/AdminShell';
import SeoForm from '@/components/admin/SeoForm';
import { db } from '@/lib/db';
import { isPageSlug, pageLabels, pagePathMap } from '@/lib/pages';
import { pages } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Page SEO' };

export default async function PageSeoRoute({ params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  if (!isPageSlug(params.slug)) notFound();
  const slug = params.slug;

  const [row] = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  if (!row) notFound();

  return (
    <AdminShell
      title={`SEO · ${pageLabels[slug]}`}
      lede={`What search engines and social previews show for ${pagePathMap[slug]}. Leave a field empty to fall back to the wording written into the page's route.`}
      user={session.user}
    >
      <Link
        href={`/admin/pages/${slug}`}
        className="mb-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-graphite transition-colors hover:text-cyan"
      >
        <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
        Back to sections
      </Link>

      <SeoForm
        pageSlug={slug}
        initial={{
          title: row.title ?? '',
          seoTitle: row.seoTitle ?? '',
          seoDescription: row.seoDescription ?? '',
          ogImage: row.ogImage ?? '',
        }}
      />
    </AdminShell>
  );
}
