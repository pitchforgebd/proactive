'use server';

import { AuthError } from 'next-auth';

import { signIn } from '@/auth';

/**
 * Sign-in Server Action.
 *
 * On success Auth.js throws a redirect, which Next handles — so this function
 * only ever *returns* when sign-in failed. `NEXT_REDIRECT` must be rethrown or
 * the redirect is swallowed and the user sits on the login page with a valid
 * session.
 *
 * The error text is the same for an unknown email and a wrong password, so the
 * form cannot be used to discover which addresses have accounts.
 */
export async function signInAction(
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const callbackUrl = String(formData.get('callbackUrl') || '/admin');

  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: safeCallback(callbackUrl),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          error.type === 'CredentialsSignin'
            ? 'That email and password do not match an account.'
            : 'Sign-in failed. Try again.',
      };
    }
    // Redirects (and anything else) must keep propagating.
    throw error;
  }
}

/**
 * Only allow same-site paths as a post-login destination — an attacker-supplied
 * `callbackUrl` must not be able to bounce a freshly authenticated admin to
 * another origin.
 */
function safeCallback(value: string): string {
  if (!value.startsWith('/') || value.startsWith('//')) return '/admin';
  return value;
}
