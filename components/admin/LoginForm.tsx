'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, LogIn } from 'lucide-react';

import { signInAction } from '@/app/admin/login/actions';

/**
 * Admin sign-in.
 *
 * Submits to a Server Action so the password never travels through client-side
 * state or a fetch this component controls. The error message is deliberately
 * the same for an unknown email and a wrong password — the form must not reveal
 * which addresses have accounts.
 */
export default function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/admin';

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    // A successful sign-in redirects, so this only ever returns on failure.
    const result = await signInAction(formData);
    if (result?.error) setError(result.error);
    setPending(false);
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div>
        <label
          htmlFor="email"
          className="block font-mono text-[11px] uppercase tracking-[0.14em] text-graphite"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          className="mt-2 w-full rounded-md border border-ink/20 bg-paper-2 px-4 py-3 text-base text-ink outline-none transition-colors focus:border-cyan focus:ring-2 focus:ring-cyan/30"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block font-mono text-[11px] uppercase tracking-[0.14em] text-graphite"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-md border border-ink/20 bg-paper-2 px-4 py-3 text-base text-ink outline-none transition-colors focus:border-cyan focus:ring-2 focus:ring-cyan/30"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="border-l-2 border-magenta bg-magenta/5 px-4 py-3 text-sm text-ink"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-band transition-colors hover:bg-magenta hover:text-white disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            Signing in
          </>
        ) : (
          <>
            <LogIn aria-hidden="true" className="h-4 w-4" />
            Sign in
          </>
        )}
      </button>
    </form>
  );
}
