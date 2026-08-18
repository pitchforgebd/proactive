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
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 200, 256, 384],
  },

  // Static hosts (Apache/cPanel) serve /path/index.html most reliably.
  trailingSlash: isStatic,

  experimental: {
    // Keeps the client bundle lean: only the icons actually used get bundled.
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

module.exports = nextConfig;
