import NotFoundBody from '@/components/layout/NotFoundBody';

/**
 * 404 boundary for the public site.
 *
 * Every notFound() in (site) — an unknown category, product or news slug —
 * resolves here. Without a not-found file inside the group, those calls fell
 * through to the root boundary and were answered with HTTP 200 carrying the
 * 404 page: a soft 404 that search engines happily index.
 *
 * Chrome comes from (site)/layout.tsx, so this renders the artwork alone.
 */
export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function SiteNotFound() {
  return <NotFoundBody />;
}
