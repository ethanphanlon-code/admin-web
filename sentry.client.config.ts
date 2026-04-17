import * as Sentry from '@sentry/nextjs';

const ENVIRONMENT = process.env.NEXT_ENV || 'development';
const RELEASE_VERSION = process.env.NEXT_PUBLIC_RELEASE_VERSION || 'unknown';

export function initSentryClient(): void {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: ENVIRONMENT,
    release: RELEASE_VERSION,

    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
      new Sentry.CaptureConsole({
        levels: ['error'],
      }),
    ],

    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    debug: ENVIRONMENT === 'development',
    attachStacktrace: true,
    maxBreadcrumbs: 50,

    beforeSend(event, hint) {
      if (event.exception) {
        const error = hint.originalException as any;
        if (error?.message?.includes('NetworkError')) {
          return null;
        }
        if (error?.message?.includes('cancelled')) {
          return null;
        }
      }
      return event;
    },

    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
    ],

    httpClient: true,
    autoSessionTracking: true,
    sessionTimeout: 30 * 60 * 1000,
    maxCacheItems: 30,
  });
}

export default Sentry;
