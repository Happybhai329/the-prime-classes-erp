import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logs incoming HTTP requests with method, URL, status code, and duration.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = request.user?.id || 'anonymous';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Date.now() - now;

          this.logger.log(
            `${method} ${url} ${statusCode} ${duration}ms - ${userId} - ${ip} - ${userAgent.substring(0, 80)}`,
          );

          // Warn on slow requests
          if (duration > 2000) {
            this.logger.warn(`⚠️ Slow request: ${method} ${url} took ${duration}ms`);
          }
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `${method} ${url} ${error.status || 500} ${duration}ms - ${userId} - ${error.message}`,
          );
        },
      }),
    );
  }
}
