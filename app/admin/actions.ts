'use server';

import { signOut } from '@/auth';

/** Ends the session and returns to the login page. */
export async function signOutAction() {
  await signOut({ redirectTo: '/admin/login' });
}
