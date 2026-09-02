import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { auth } from '@/auth';
import AdminShell from '@/components/admin/AdminShell';
import SettingsForm from '@/components/admin/SettingsForm';
import SettingsNav from '@/components/admin/SettingsNav';
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);

  return (
    <AdminShell
      title="Settings"
      lede="Logo, favicon, footer QR, contact, socials, map, and Verification & Head Tags. Empty verification or analytics fields remove those tags from the public site."
      user={session.user}
    >
      <SettingsNav active="general" />
      <SettingsForm
        initial={{
          companyName: row?.companyName ?? '',
          logo: row?.logo ?? '',
          logoTitle: row?.logoTitle ?? 'Proactive',
          logoSubtitle: row?.logoSubtitle ?? "Trade Int'l",
          footerTagline:
            row?.footerTagline ??
            'One-stop printing & packaging solutions — machineries, press room chemicals, inks, coatings and consumables, backed by dedicated technical support across Bangladesh.',
          favicon: row?.favicon ?? '',
          qrCode: row?.qrCode ?? '',
          qrCodeCaption: row?.qrCodeCaption ?? '',
          phone: row?.phone ?? '',
          whatsapp: row?.whatsapp ?? '',
          email: row?.email ?? '',
          address: row?.address ?? '',
          mapQuery: row?.mapQuery ?? '',
          facebook: row?.facebook ?? '',
          linkedin: row?.linkedin ?? '',
          instagram: row?.instagram ?? '',
          youtube: row?.youtube ?? '',
          seoGoogleVerification: row?.seoGoogleVerification ?? '',
          seoBingVerification: row?.seoBingVerification ?? '',
          seoGa4Id: row?.seoGa4Id ?? '',
          seoGtmId: row?.seoGtmId ?? '',
          seoMetaPixelId: row?.seoMetaPixelId ?? '',
          seoFacebookDomainVerification: row?.seoFacebookDomainVerification ?? '',
          seoYandexVerification: row?.seoYandexVerification ?? '',
          seoPinterestVerification: row?.seoPinterestVerification ?? '',
          seoAhrefsVerification: row?.seoAhrefsVerification ?? '',
          seoCustomHeadTags: row?.seoCustomHeadTags ?? '',
        }}
      />
    </AdminShell>
  );
}
