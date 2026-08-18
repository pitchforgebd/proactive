'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { contactSchema, type ContactInput } from '@/lib/validation';
import { Field, controlClass } from '@/components/forms/Field';

type Status = 'idle' | 'submitting' | 'sent' | 'error';

/** Endpoint is env-driven so Mode B (static export) can point at a PHP handler. */
const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? '/api/contact';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '', website: '' },
  });

  const onSubmit = async (values: ContactInput) => {
    setStatus('submitting');
    setServerError(null);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? 'The message did not go through.');
      }

      setStatus('sent');
      reset();
    } catch (err) {
      setStatus('error');
      setServerError(
        err instanceof Error ? err.message : 'The message did not go through.',
      );
    }
  };

  if (status === 'sent') {
    return (
      <div className="border border-cyan/40 bg-paper-2 p-8">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan text-ink">
          <Check aria-hidden="true" className="h-5 w-5" />
        </span>
        <h3 className="mt-6 text-lg font-bold">Message received.</h3>
        <p className="mt-3 max-w-md text-base text-graphite">
          Our team will respond within one business day. For anything urgent,
          call the number listed alongside — it reaches a person, not a queue.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-ink underline underline-offset-4 transition-colors hover:text-magenta"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Honeypot — visually and programmatically hidden from people. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="contact-name" label="Name" required error={errors.name?.message}>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            className={controlClass}
            {...register('name')}
          />
        </Field>

        <Field id="contact-email" label="Email" required error={errors.email?.message}>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            className={controlClass}
            {...register('email')}
          />
        </Field>

        <Field id="contact-phone" label="Phone" error={errors.phone?.message}>
          <input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
            className={controlClass}
            {...register('phone')}
          />
        </Field>

        <Field id="contact-subject" label="Subject" required error={errors.subject?.message}>
          <input
            id="contact-subject"
            type="text"
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
            className={controlClass}
            {...register('subject')}
          />
        </Field>
      </div>

      <Field
        id="contact-message"
        label="Message"
        required
        error={errors.message?.message}
        hint="Machine, substrate, run length — the more specific, the faster we can answer."
      >
        <textarea
          id="contact-message"
          rows={6}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          className={`${controlClass} resize-y`}
          {...register('message')}
        />
      </Field>

      {status === 'error' && serverError && (
        <p role="alert" className="border border-magenta/40 bg-magenta/5 px-4 py-3 text-sm text-magenta">
          {serverError} Try again, or email us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="group inline-flex items-center justify-center gap-2 rounded-sm bg-ink px-7 py-3.5 font-mono text-xs uppercase tracking-[0.16em] text-paper transition-colors hover:bg-magenta disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            Sending
          </>
        ) : (
          <>
            Send Message
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 ease-press group-hover:translate-x-1"
            />
          </>
        )}
      </button>
    </form>
  );
}
