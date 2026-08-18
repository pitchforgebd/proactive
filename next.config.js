/**
 * Next.js config — Proactive Trade International
 *
 * Two cPanel deploy modes (see CLAUDE.md §3). Switching between them is a
 * one-line change: set DEPLOY_MODE in the environment (or edit the default).
 *
 *   DEPLOY_MODE=node    → Mode A. Node.js app via cPanel "Setup Node.js App".
 *                         Gives SSR + ISR (live dashboard content, no rebuild).
 *                         Build output: .next/standalone
 *
 *   DEPLOY_MODE=static  → Mode B. Static export to /out, uploaded to public_html.
 *                         No SSR/ISR; image optimizer is off; dynamic content
 *                         needs a rebuild-on-publish step or a client-side fetch
 *                         against a separate API on the same cPanel.
 *
 * Nothing in the app uses a server-only API that Mode B cannot handle, so the
 * codebase stays buildable in both modes.
 */
const DEPLOY_MODE = process.env.DEPLOY_MODE === 'static' ? 'static' : 'node';
const isStatic = DEPLOY_MODE === 'static';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Mode A: 'standalone' bundles a minimal server for Passenger/Node.
  // Mode B: 'export' emits a fully static /out directory.
  output: isStatic ? 'export' : 'standalone',

  // Static export cannot run the image optimizer at request time.
  images: {
    unoptimized: isStatic,
    formats: ['image/avif', 'image/webp'],
    // Only YouTube poster frames are remote — the video gallery renders a
    // thumbnail facade instead of eager iframes (CLAUDE.md §5.6).
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
    ],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 200, 256, 384],
  },

  // Static hosts (Apache/cPanel) serve /path/index.html most reliably.
  trailingSlash: isStatic,

  /**
   * Route handlers are named `route.node.ts` and only registered when that
   * extension is listed here. Mode A picks them up; Mode B (static export)
   * omits the extension, so the POST handlers are excluded from the build
   * instead of failing it — static export cannot serve them. In Mode B the
   * forms post to NEXT_PUBLIC_CONTACT_ENDPOINT / NEXT_PUBLIC_CAREER_ENDPOINT
   * (e.g. a small PHP handler on the same cPanel). See README.md.
   */
  pageExtensions: isStatic ? ['tsx', 'ts'] : ['tsx', 'ts', 'node.ts'],

  experimental: {
    // Keeps the client bundle lean: only the icons actually used get bundled.
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

module.exports = nextConfig;
