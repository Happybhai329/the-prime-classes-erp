import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, finalize } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ApiUsageInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startedAt = Date.now();

    return next.handle().pipe(
      finalize(() => {
        if (!request.apiClient) return;
        void this.prisma.apiUsageLog.create({
          data: {
            clientId: request.apiClient.id,
            organizationId: request.organizationId || null,
            tenantId: request.tenantId || null,
            method: request.method,
            path: request.originalUrl || request.url,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
            ipAddress: request.ip || null,
          },
        });
      }),
    );
  }
}
