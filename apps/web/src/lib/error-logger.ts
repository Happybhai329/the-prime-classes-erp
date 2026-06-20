// Centeralized Frontend Error Logger

interface ErrorContext {
  errorInfo?: any;
  context?: {
    route?: string;
    role?: string;
    tenantId?: string;
  };
}

class ErrorLogger {
  private isProduction = import.meta.env.PROD;

  public init() {
    // Capture global window errors
    window.onerror = (message, source, lineno, colno, error) => {
      this.logError(error || new Error(String(message)), {
        context: {
          route: window.location.pathname,
        },
        errorInfo: { source, lineno, colno },
      });
      return false; // let browser handle normally as well
    };

    // Capture unhandled promise rejections
    window.onunhandledrejection = (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      this.logError(error, {
        context: {
          route: window.location.pathname,
        },
      });
    };

    if (this.isProduction) {
      console.log('🛡️ Production Error Logger Initialized');
      // Here you would initialize Sentry:
      // Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });
    }
  }

  public logError(error: Error, extraInfo?: ErrorContext) {
    if (this.isProduction) {
      // In production, log structured data to console safely without full stacks if needed,
      // and send to Sentry/monitoring backend.
      console.error('[PROD_ERROR]', {
        message: error.message,
        route: extraInfo?.context?.route || window.location.pathname,
        role: extraInfo?.context?.role,
        tenantId: extraInfo?.context?.tenantId,
        errorInfo: extraInfo?.errorInfo,
      });

      // Prepare Sentry send hook:
      // Sentry.withScope((scope) => {
      //   if (extraInfo?.context) scope.setContext('user_context', extraInfo.context);
      //   Sentry.captureException(error);
      // });
    } else {
      // In development, log full verbose trace to console
      console.group('🛠️ [DEV_ERROR] Caught by Logger');
      console.error(error);
      if (extraInfo) {
        console.log('Extra Context:', extraInfo);
      }
      console.groupEnd();
    }
  }
}

export const errorLogger = new ErrorLogger();
export default errorLogger;
