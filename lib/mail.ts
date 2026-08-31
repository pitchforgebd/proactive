/**
 * Optional SMTP notifications (PHASE2-BACKEND.md §10 / §11).
 *
 * Enabled when SMTP_HOST, SMTP_USER and SMTP_PASS are all non-empty (after
 * trim). Otherwise every notify* call is a no-op — forms still persist to the
 * admin inbox. Credentials come only from the environment (cPanel Node panel
 * or .env); never hardcode them.
 *
 * Recipient priority (preserved):
 *   1. Settings.email  (dashboard /admin/settings)
 *   2. SMTP_TO         (env override)
 *   3. SMTP_USER       (mailbox address)
 *
 * From address: SMTP_FROM → SMTP_USER → noreply@proactive.com.bd
 *
 * Failures are logged (message only — no secrets) and swallowed: a mail outage
 * must never turn a saved enquiry into a 500 for the visitor.
 */
import 'server-only';

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { getSiteSettings } from '@/lib/data';

let transporter: Transporter | null | undefined;

function envTrim(name: string): string {
  return process.env[name]?.trim() ?? '';
}

/** True when outbound mail is configured. Exported for ops/scripts only. */
export function isSmtpConfigured(): boolean {
  return Boolean(envTrim('SMTP_HOST') && envTrim('SMTP_USER') && envTrim('SMTP_PASS'));
}

/** Lazily build one transporter per process; null when SMTP is disabled. */
function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;

  if (!isSmtpConfigured()) {
    transporter = null;
    return null;
  }

  const port = Number(envTrim('SMTP_PORT') || '465');
  transporter = nodemailer.createTransport({
    host: envTrim('SMTP_HOST'),
    port,
    // 465 = implicit TLS; 587 = STARTTLS.
    secure: port === 465,
    auth: {
      user: envTrim('SMTP_USER'),
      pass: envTrim('SMTP_PASS'),
    },
  });
  return transporter;
}

/** Who receives form alerts — see file header for priority. */
async function notifyTo(): Promise<string | null> {
  const settings = await getSiteSettings();
  const fromSettings = settings.email?.trim();
  if (fromSettings) return fromSettings;

  const override = envTrim('SMTP_TO');
  if (override) return override;

  return envTrim('SMTP_USER') || null;
}

function notifyFrom(): string {
  return envTrim('SMTP_FROM') || envTrim('SMTP_USER') || 'noreply@proactive.com.bd';
}

/** Log failure without dumping objects that might carry auth material. */
function logMailFailure(label: string, error: unknown) {
  const message = error instanceof Error ? error.message : 'unknown error';
  console.error(`[mail] ${label} notify failed:`, message);
}

export interface ContactNotifyPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface CareerNotifyPayload {
  fullName: string;
  email: string;
  phone?: string;
  position?: string;
  coverLetter: string;
}

/** Safe after DB insert: never throws to callers. No-op if SMTP unset. */
export async function notifyContactMessage(
  payload: ContactNotifyPayload,
): Promise<void> {
  const tx = getTransporter();
  if (!tx) return;

  const to = await notifyTo();
  if (!to) return;

  try {
    await tx.sendMail({
      from: notifyFrom(),
      to,
      replyTo: payload.email,
      subject: `[Contact] ${payload.subject}`,
      text: [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        payload.phone ? `Phone: ${payload.phone}` : null,
        `Subject: ${payload.subject}`,
        '',
        payload.message,
        '',
        '— View in dashboard: /admin/contact',
      ]
        .filter((line) => line !== null)
        .join('\n'),
    });
  } catch (error) {
    logMailFailure('contact', error);
  }
}

/**
 * Safe after DB insert: never throws. CV is never attached — admins download
 * from /admin/career via the authenticated resume route.
 */
export async function notifyCareerApplication(
  payload: CareerNotifyPayload,
): Promise<void> {
  const tx = getTransporter();
  if (!tx) return;

  const to = await notifyTo();
  if (!to) return;

  try {
    await tx.sendMail({
      from: notifyFrom(),
      to,
      replyTo: payload.email,
      subject: `[Career] ${payload.position || 'Application'} — ${payload.fullName}`,
      text: [
        `Name: ${payload.fullName}`,
        `Email: ${payload.email}`,
        payload.phone ? `Phone: ${payload.phone}` : null,
        payload.position ? `Position: ${payload.position}` : null,
        '',
        'Cover letter:',
        payload.coverLetter,
        '',
        'Resume: download from /admin/career (not attached — private storage).',
      ]
        .filter((line) => line !== null)
        .join('\n'),
    });
  } catch (error) {
    logMailFailure('career', error);
  }
}
