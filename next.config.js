/**
 * Next.js config — Proactive Trade International
 *
 * DEPLOY MODE A ONLY: Node.js standalone, run through cPanel "Setup Node.js
 * App" (PHASE2-BACKEND.md §12). Phase 1 also kept a static-export fallback;
 * Phase 2 retires it, because every capability this phase adds — the database,
 * route handlers, Server Actions, sessions and on-demand ISR — requires a Node
 * runtime. There is no longer a mode to switch between.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Bundles a minimal server (.next/standalone) for Passenger/Node.
  output: 'standalone',

  images: {
    formats: ['image/avif', 'image/webp'],
    // Only YouTube poster frames are remote — the video gallery renders a
    // thumbnail facade instead of eager iframes (CLAUDE.md §5.6).
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
    ],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 200, 256, 384],
  },

  /**
   * Baseline response headers (PHASE2-BACKEND.md §14).
   * HSTS belongs on the cPanel/SSL vhost once the domain is HTTPS-only —
   * setting it here would break local http:// development.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/about/founder-message',
        destination: '/about/leadership-message',
        permanent: true,
      },
    ];
  },

  experimental: {
    // Shared hosting (CloudLinux LVE): one compile worker — avoids EAGAIN /
    // "Unable to fork" when Next tries to spawn jest-worker children.
    cpus: 1,
    workerThreads: false,
    // Keeps the client bundle lean: only the icons actually used get bundled.
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    // Never bundle these into the server build — they load natively at runtime.
    serverComponentsExternalPackages: ['mysql2', 'bcryptjs', 'nodemailer'],
  },
};

module.exports = nextConfig;
