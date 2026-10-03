// This file configures the initialization of Sentry on the client (browser).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Safe trace sampling rate:
  // - 100% (1.0) in development for local testing and verification
  // - 10% (0.1) in production to capture representative performance spans without excessive quota usage
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session Replay is intentionally omitted by default to safeguard customer privacy,
  // preventing accidental capture of sensitive customer checkout and payment data.

  // Setting debug to false in production to prevent console noise
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
