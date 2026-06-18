import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { context as otelContext, trace } from '@opentelemetry/api';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = request.user?.sub || request.user?.id || 'anonymous';
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const durationMs = Date.now() - startedAt;
          const span = trace.getSpan(otelContext.active());

          this.logger.log(
            JSON.stringify({
              type: 'http_request',
              requestId: request.requestId,
              traceId: span?.spanContext().traceId,
              method,
              url,
              statusCode: response.statusCode,
              durationMs,
              userId,
              tenantId: request.user?.tenantId || request.tenantId,
              organizationId: request.organizationId,
              ip,
              userAgent: userAgent.substring(0, 160),
            }),
          );

          if (durationMs > 2000) {
            this.logger.warn(
              JSON.stringify({
                type: 'slow_request',
                requestId: request.requestId,
                method,
                url,
                durationMs,
              }),
            );
          }
        },
        error: (error) => {
          const durationMs = Date.now() - startedAt;
          this.logger.error(
            JSON.stringify({
              type: 'http_error',
              requestId: request.requestId,
              method,
              url,
              statusCode: error.status || 500,
              durationMs,
              userId,
              tenantId: request.user?.tenantId || request.tenantId,
              organizationId: request.organizationId,
              errorCode: error.code,
              message: error.message,
            }),
          );
        },
      }),
    );
  }
}
