import type { Metadata } from 'next';
import { Suspense } from 'react';

import LoginForm from '@/components/admin/LoginForm';
import Logo from '@/components/layout/Logo';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

/**
 * The one /admin route the middleware lets through unauthenticated. An admin
 * who is already signed in is redirected to /admin by the authorized() callback
 * in auth.config.ts, so this page is never a dead end.
 */
export default function AdminLoginPage() {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <Logo />
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">
            Dashboard
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold leading-tight">
            Sign in to manage the site.
          </h1>
        </div>

        <div className="rounded-xl border border-ink/10 bg-paper-2 p-7">
          {/* useSearchParams needs a Suspense boundary to stay statically rendered. */}
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-sm text-graphite">
          Locked out? Reset the password from the server with{' '}
          <code className="font-mono text-xs text-ink">npm run create-admin</code>.
        </p>
      </div>
    </main>
  );
}
