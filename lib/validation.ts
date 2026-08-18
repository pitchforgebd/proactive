import { z } from 'zod';

/**
 * Form schemas. Shared by the client forms (react-hook-form resolver) and the
 * API routes, so validation cannot drift between the two.
 */

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB

export const ACCEPTED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(120),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[\d+()\s-]*$/, 'Use digits, spaces and + ( ) - only.')
    .optional()
    .or(z.literal('')),
  subject: z.string().trim().min(3, 'Add a subject.').max(160),
  message: z
    .string()
    .trim()
    .min(20, 'Tell us a little more — at least 20 characters.')
    .max(4000),
  /**
   * Honeypot. Deliberately permissive: the schema must ACCEPT a filled value so
   * the route handler can answer 200 and discard it silently. Rejecting here
   * would return 422 and tell the bot exactly which field caught it.
   */
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Fields only — the resume file is validated separately (see resumeFileSchema). */
export const careerSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.').max(120),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .min(6, 'Enter a contact number.')
    .max(40)
    .regex(/^[\d+()\s-]+$/, 'Use digits, spaces and + ( ) - only.'),
  position: z.string().trim().min(2, 'Select or type the position.').max(160),
  coverLetter: z
    .string()
    .trim()
    .min(40, 'Tell us why you are a fit — at least 40 characters.')
    .max(5000),
  /** Honeypot — see the note on contactSchema.website. */
  website: z.string().max(200).optional(),
});

export type CareerInput = z.infer<typeof careerSchema>;

/** Runs in both the browser (File) and the route handler (File from FormData). */
export const resumeFileSchema = z
  .custom<File>((f) => typeof File !== 'undefined' && f instanceof File, {
    message: 'Attach your CV.',
  })
  .refine((f) => f.size > 0, 'Attach your CV.')
  .refine((f) => f.size <= MAX_RESUME_BYTES, 'Keep the file under 5 MB.')
  .refine(
    (f) =>
      ACCEPTED_RESUME_TYPES.includes(f.type) || /\.(pdf|docx?)$/i.test(f.name),
    'Use a PDF or Word document.',
  );

export { MAX_RESUME_BYTES };
