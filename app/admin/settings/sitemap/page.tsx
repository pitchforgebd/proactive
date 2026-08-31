import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import AdminShell from '@/components/admin/AdminShell';
import SettingsNav from '@/components/admin/SettingsNav';
import SitemapPanel from '@/components/admin/SitemapPanel';
import { pageLabels, pagePathMap } from '@/lib/pages';
import {
  cmsPageSitemapConfig,
  SITEMAP_CONTENT_TYPE_CONFIG,
} from '@/lib/seo/sitemap-config';
import { getPublicSitemapEntries } from '@/lib/seo/sitemap-source';
import {
  publicSitemapUrl,
  summarizeSitemapEntries,
} from '@/lib/seo/sitemap-summary';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sitemap' };

const ISR_SECONDS = 60;

export default async function SettingsSitemapPage() {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  const entries = await getPublicSitemapEntries();
  const breakdown = summarizeSitemapEntries(entries);

  const cmsPages = cmsPageSitemapConfig().map((row) => ({
    slug: row.slug,
    label: pageLabels[row.slug],
    path: pagePathMap[row.slug],
    priority: row.priority,
    changeFrequency: row.changeFrequency,
  }));

  return (
    <AdminShell
      title="Sitemap"
      lede="Public /sitemap.xml is generated dynamically from the database. Refreshing revalidates the cached route — it does not write a file to disk."
      user={session.user}
    >
      <SettingsNav active="sitemap" />
      <SitemapPanel
        sitemapUrl={publicSitemapUrl()}
        initialBreakdown={breakdown}
        contentTypes={SITEMAP_CONTENT_TYPE_CONFIG}
        cmsPages={cmsPages}
        isrSeconds={ISR_SECONDS}
      />
    </AdminShell>
  );
}
