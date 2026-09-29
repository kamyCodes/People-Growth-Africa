import { z } from 'zod';
import { ApiError } from './http';

/**
 * Server side validation is the real check. These schemas are strict, so a
 * request carrying any key that is not listed here is rejected outright, and
 * every string is trimmed and length capped before it reaches the database.
 */

const NAME_MAX = 100;
const EMAIL_MAX = 254;
const COMPANY_MAX = 150;
const FIELD_MAX = 100;
const COUNTRY_MAX = 60;
const PASSWORD_MAX = 128;

function requiredText(max: number, label: string, message?: string): z.ZodString {
  return z
    .string()
    .trim()
    .min(1, message ?? `Enter your ${label}.`)
    .max(max, `${label.charAt(0).toUpperCase()}${label.slice(1)} must be ${max} characters or fewer.`);
}

function optionalText(max: number, label: string): z.ZodOptional<z.ZodString> {
  return z
    .string()
    .trim()
    .max(max, `${label.charAt(0).toUpperCase()}${label.slice(1)} must be ${max} characters or fewer.`)
    .optional();
}

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(EMAIL_MAX, `Email must be ${EMAIL_MAX} characters or fewer.`)
  .pipe(z.email('Enter an email address in the form name@example.com.'));

const password = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .max(PASSWORD_MAX, `Password must be ${PASSWORD_MAX} characters or fewer.`);

const acceptedTerms = z
  .boolean()
  .refine((value) => value === true, 'Agree to the terms and privacy policy to continue.');

export const AVAILABILITY_OPTIONS = ['available_now', 'within_30_days', 'just_exploring'] as const;
export const NEED_OPTIONS = ['find_talent', 'book_consultation'] as const;

export const talentSignupSchema = z.strictObject({
  role: z.literal('talent'),
  name: requiredText(NAME_MAX, 'full name'),
  email,
  password,
  field: requiredText(FIELD_MAX, 'field', 'Enter your field or main skill.'),
  country: optionalText(COUNTRY_MAX, 'country'),
  availability: z.enum(AVAILABILITY_OPTIONS).optional(),
  acceptedTerms,
});

export const employerSignupSchema = z.strictObject({
  role: z.literal('employer'),
  name: requiredText(NAME_MAX, 'full name'),
  company: requiredText(COMPANY_MAX, 'company or organisation'),
  email,
  password,
  needs: z
    .array(z.enum(NEED_OPTIONS))
    .min(1, 'Choose at least one: find talent or book a consultation.')
    .max(NEED_OPTIONS.length),
  acceptedTerms,
});

export const signupSchema = z.discriminatedUnion('role', [
  talentSignupSchema,
  employerSignupSchema,
]);

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.strictObject({
  email,
  password: z
    .string()
    .min(1, 'Enter your password.')
    .max(PASSWORD_MAX, `Password must be ${PASSWORD_MAX} characters or fewer.`),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.strictObject({ email });

export const resetPasswordSchema = z.strictObject({
  token: z.string().trim().min(20, 'That reset link is not valid.').max(200),
  password,
});

export const verifyEmailSchema = z.strictObject({
  token: z.string().trim().min(20, 'That verification link is not valid.').max(200),
});

/**
 * Actions with no inputs still take a body check, so an unexpected key is
 * rejected instead of silently ignored.
 */
export const emptyBodySchema = z.strictObject({});

export const deleteAccountSchema = z.strictObject({
  password: z.string().min(1, 'Enter your password to confirm.').max(PASSWORD_MAX),
});

/**
 * Turns a schema result into either validated data or a 400 carrying the exact
 * fields at fault, so the client can point at the input instead of apologising.
 */
export function parseInput<Schema extends z.ZodType>(schema: Schema, input: unknown): z.output<Schema> {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.length > 0 ? issue.path.map(String).join('.') : 'form';
    if (!(key in fields)) fields[key] = issue.message;
  }

  const first = result.error.issues[0]?.message ?? 'Check the highlighted fields.';
  throw new ApiError(400, 'validation_failed', first, fields);
}
