import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

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
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

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
    } else {
      // Non-HTTP exceptions (crashes, unhandled errors)
      const err = exception as Error;
      this.logger.error(
        `Unhandled exception: ${err.message}`,
        err.stack,
      );
    }

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
