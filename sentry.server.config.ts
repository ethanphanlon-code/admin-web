import * as Sentry from '@sentry/nextjs';

const ENVIRONMENT = process.env.NODE_ENV || 'development';
const RELEASE_VERSION = process.env.RELEASE_VERSION || 'unknown';

export function initSentryServer(): void {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: ENVIRONMENT,
    release: RELEASE_VERSION,

    integrations: [
      new Sentry.Integrations.Console(),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],

    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    debug: ENVIRONMENT === 'development',
    attachStacktrace: true,
    maxBreadcrumbs: 100,

    beforeSend(event, hint) {
      if (event.request?.url?.includes('/health')) {
        return null;
      }

      if (event.exception) {
        const error = hint.originalException as any;
        if (error?.statusCode === 503 || error?.code === 'ECONNREFUSED') {
          return null;
        }
      }

      return event;
    },

    includeLocalVariables: true,
    captureUnhandledRejections: true,
  });
}

export default Sentry;
