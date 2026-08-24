import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NotFoundBody from '@/components/layout/NotFoundBody';

/**
 * Global 404 — for URLs that match no route at all.
 *
 * This file sits at the app root, above the (site) route group, so it is
 * outside the layout that supplies the header and footer and has to render
 * them itself.
 */
export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main">
        <NotFoundBody />
      </main>
      <Footer />
    </>
  );
}
