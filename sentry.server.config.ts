import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  debug: process.env.NODE_ENV === 'development',

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
});
