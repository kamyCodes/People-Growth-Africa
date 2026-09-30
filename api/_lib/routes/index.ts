import type { VercelRequest, VercelResponse } from '@vercel/node';

import account from './auth/account.js';
import forgotPassword from './auth/forgot-password.js';
import login from './auth/login.js';
import logoutAll from './auth/logout-all.js';
import logout from './auth/logout.js';
import me from './auth/me.js';
import resendVerification from './auth/resend-verification.js';
import resetPassword from './auth/reset-password.js';
import signup from './auth/signup.js';
import verifyEmail from './auth/verify-email.js';
import consultationBooking from './leads/consultation-booking.js';
import enquiry from './leads/enquiry.js';
import eventRegistration from './leads/event-registration.js';
import newsletterConfirm from './newsletter/confirm.js';
import newsletterSubscribe from './newsletter/subscribe.js';

export type RouteHandler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

/**
 * Every endpoint the API serves, keyed by its path with `/api` stripped.
 *
 * Vercel gives every file in api/ that is not behind an underscore its own
 * serverless function, and the Hobby plan allows twelve of them per deployment.
 * Past twelve the build succeeds and the deployment then fails outright with
 * `exceeded_serverless_functions_per_deployment`, so the handlers live under
 * api/_lib/routes/ (never counted) and are reached through this table from the
 * single function in api/[...path].ts.
 *
 * The public URLs are unchanged: /api/auth/login is still /api/auth/login, and
 * so on. Writing the surface out by hand rather than walking the directory
 * keeps it readable in one place, and a route that is missing from the table is
 * a 404 in production only if someone forgets to add it here too - which is why
 * the table is the only way in.
 */
export const ROUTES: Record<string, RouteHandler> = {
  '/auth/account': account,
  '/auth/forgot-password': forgotPassword,
  '/auth/login': login,
  '/auth/logout': logout,
  '/auth/logout-all': logoutAll,
  '/auth/me': me,
  '/auth/resend-verification': resendVerification,
  '/auth/reset-password': resetPassword,
  '/auth/signup': signup,
  '/auth/verify-email': verifyEmail,
  '/leads/consultation-booking': consultationBooking,
  '/leads/enquiry': enquiry,
  '/leads/event-registration': eventRegistration,
  '/newsletter/confirm': newsletterConfirm,
  '/newsletter/subscribe': newsletterSubscribe,
};
