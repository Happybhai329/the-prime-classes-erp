import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { logger } from '../config/winston.config';

/**
 * Global exception filter — normalises ALL errors to a consistent shape:
 * { success: false, error: { code, message, details? }, timestamp }
 *
 * Handles:
 * - ValidationPipe errors (class-validator)
 * - HttpException variants (NotFound, Unauthorized, Forbidden, etc.)
 * - Unexpected / internal server errors
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<any>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'string') {
        message = exResponse;
      } else if (typeof exResponse === 'object') {
        const obj = exResponse as Record<string, unknown>;
        message = (obj.message as string) || exception.message;

        // class-validator returns message as array
        if (Array.isArray(obj.message)) {
          message = 'Validation failed';
          details = { validation: obj.message as string[] };
          code = 'VALIDATION_ERROR';
        }
      }

      // Map status to error code
      if (code !== 'VALIDATION_ERROR') {
        switch (status) {
          case HttpStatus.UNAUTHORIZED:
            code = 'UNAUTHORIZED';
            break;
          case HttpStatus.FORBIDDEN:
            code = 'FORBIDDEN';
            break;
          case HttpStatus.NOT_FOUND:
            code = 'NOT_FOUND';
            break;
          case HttpStatus.CONFLICT:
            code = 'CONFLICT';
            break;
          case HttpStatus.TOO_MANY_REQUESTS:
            code = 'RATE_LIMIT_EXCEEDED';
            break;
          default:
            code = `HTTP_${status}`;
        }
      }
    }

    const requestId = request.headers?.['x-request-id'] || 'none';
    const tenantId = request.headers?.['x-tenant-slug'] || request.headers?.['x-tenant-id'] || request.user?.tenantId || 'none';
    const userId = request.user?.sub || request.user?.id || 'none';
    const method = request.method;
    const url = request.url;

    // Structured JSON log using winston
    logger.error({
      message: `Error handled by filter: ${message}`,
      context: 'AllExceptionsFilter',
      requestId,
      tenantId,
      userId,
      method,
      url,
      code,
      status,
      fingerprint: `${method}:${url.split('?')[0]}:${code}`,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // Prepare Sentry captureException hook
    // Sentry.withScope((scope) => {
    //   scope.setTag('requestId', requestId);
    //   scope.setTag('tenantId', tenantId);
    //   scope.setTag('userId', userId);
    //   scope.setExtra('method', method);
    //   scope.setExtra('url', url);
    //   scope.setFingerprint([method, url.split('?')[0], code]);
    //   Sentry.captureException(exception);
    // });

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
    });
  }
}
