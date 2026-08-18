'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, Loader2, Paperclip } from 'lucide-react';
import type { JobOpening } from '@/lib/types';
import {
  ACCEPTED_RESUME_TYPES,
  careerSchema,
  resumeFileSchema,
  type CareerInput,
} from '@/lib/validation';
import { Field, controlClass } from '@/components/forms/Field';

type Status = 'idle' | 'submitting' | 'sent' | 'error';

const ENDPOINT = process.env.NEXT_PUBLIC_CAREER_ENDPOINT ?? '/api/career';

/**
 * Job application form. The resume file is validated separately from the text
 * fields (react-hook-form does not own the file input), then everything is sent
 * as multipart FormData so the upload streams rather than being base64'd.
 */
export default function CareerForm({ openings }: { openings: JobOpening[] }) {
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CareerInput>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      position: '',
      coverLetter: '',
      website: '',
    },
  });

  const onSubmit = async (values: CareerInput) => {
    const file = fileRef.current?.files?.[0];
    const fileCheck = resumeFileSchema.safeParse(file);

    if (!fileCheck.success) {
      setResumeError(fileCheck.error.issues[0]?.message ?? 'Attach your CV.');
      return;
    }

    setResumeError(null);
    setStatus('submitting');
    setServerError(null);

    try {
      const body = new FormData();
      Object.entries(values).forEach(([k, v]) => body.append(k, v ?? ''));
      body.append('resume', fileCheck.data);

      const res = await fetch(ENDPOINT, { method: 'POST', body });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? 'The application did not go through.');
      }

      setStatus('sent');
      reset();
      setResumeName(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setStatus('error');
      setServerError(
        err instanceof Error ? err.message : 'The application did not go through.',
      );
    }
  };

  if (status === 'sent') {
    return (
      <div className="border border-cyan/40 bg-paper-2 p-8">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan text-ink">
          <Check aria-hidden="true" className="h-5 w-5" />
        </span>
        <h3 className="mt-6 text-lg font-bold">Application received.</h3>
        <p className="mt-3 max-w-md text-base text-graphite">
          Your CV is with our team. If your experience matches an opening, we will
          contact you to arrange a conversation.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-ink underline underline-offset-4 transition-colors hover:text-magenta"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Honeypot — visually and programmatically hidden from people. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="career-website">Website</label>
        <input id="career-website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="career-name" label="Full name" required error={errors.fullName?.message}>
          <input
            id="career-name"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'career-name-error' : undefined}
            className={controlClass}
            {...register('fullName')}
          />
        </Field>

        <Field id="career-email" label="Email" required error={errors.email?.message}>
          <input
            id="career-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'career-email-error' : undefined}
            className={controlClass}
            {...register('email')}
          />
        </Field>

        <Field id="career-phone" label="Phone" required error={errors.phone?.message}>
          <input
            id="career-phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'career-phone-error' : undefined}
            className={controlClass}
            {...register('phone')}
          />
        </Field>

        <Field
          id="career-position"
          label="Position applied for"
          required
          error={errors.position?.message}
        >
          {/* A select when we have openings listed, free text when we do not. */}
          {openings.length > 0 ? (
            <select
              id="career-position"
              aria-invalid={!!errors.position}
              aria-describedby={errors.position ? 'career-position-error' : undefined}
              className={controlClass}
              defaultValue=""
              {...register('position')}
            >
              <option value="" disabled>
                Select a position
              </option>
              {openings.map((o) => (
                <option key={o.id} value={o.title}>
                  {o.title}
                </option>
              ))}
              <option value="Open application">Open application</option>
            </select>
          ) : (
            <input
              id="career-position"
              type="text"
              aria-invalid={!!errors.position}
              aria-describedby={errors.position ? 'career-position-error' : undefined}
              className={controlClass}
              {...register('position')}
            />
          )}
        </Field>
      </div>

      <Field
        id="career-cover"
        label="Cover letter"
        required
        error={errors.coverLetter?.message}
        hint="What you have worked on, and what you want to work on next."
      >
        <textarea
          id="career-cover"
          rows={6}
          aria-invalid={!!errors.coverLetter}
          aria-describedby={errors.coverLetter ? 'career-cover-error' : undefined}
          className={controlClass + ' resize-y'}
          {...register('coverLetter')}
        />
      </Field>

      <Field
        id="career-resume"
        label="Resume"
        required
        error={resumeError ?? undefined}
        hint="PDF or Word document, up to 5 MB."
      >
        <div className="flex flex-wrap items-center gap-4">
          <label
            htmlFor="career-resume"
            className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-ink/25 px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:border-cyan hover:text-cyan"
          >
            <Paperclip aria-hidden="true" className="h-3.5 w-3.5" />
            Choose file
          </label>
          <input
            ref={fileRef}
            id="career-resume"
            type="file"
            accept={ACCEPTED_RESUME_TYPES.join(',') + ',.pdf,.doc,.docx'}
            aria-invalid={!!resumeError}
            aria-describedby={resumeError ? 'career-resume-error' : undefined}
            onChange={(e) => {
              setResumeName(e.target.files?.[0]?.name ?? null);
              setResumeError(null);
            }}
            className="sr-only"
          />
          <span className="text-sm text-graphite">
            {resumeName ?? 'No file selected'}
          </span>
        </div>
      </Field>

      {status === 'error' && serverError && (
        <p role="alert" className="border border-magenta/40 bg-magenta/5 px-4 py-3 text-sm text-magenta">
          {serverError} Try again, or email your CV directly.
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
            Submitting
          </>
        ) : (
          <>
            Submit Application
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
