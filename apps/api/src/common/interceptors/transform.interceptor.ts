import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Wraps all successful responses in a standard envelope:
 * { success: true, data: ..., message: "..." }
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, { success: boolean; data: T; message: string }>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ success: boolean; data: T; message: string }> {
    return next.handle().pipe(
      map((data) => {
        // If response already has success property, pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        return {
          success: true,
          data,
          message: 'OK',
        };
      }),
    );
  }
}
