import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators';

/**
 * Wraps all successful API responses in a consistent envelope:
 * { success: true, data: <response>, message: "OK", timestamp: "..." }
 *
 * This ensures Android/iOS apps receive a predictable response shape.
 * Skips transformation for Swagger docs and health checks.
 */
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        // If data is already wrapped (has success field), pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        return {
          success: true,
          data: data ?? null,
          message: 'OK',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
