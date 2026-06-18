import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHash, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { API_SCOPES_KEY } from './api-platform.constants';
import { ApiRateLimitService } from './api-rate-limit.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
    private readonly rateLimits: ApiRateLimitService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const rawKey = request.headers['x-api-key'];
    if (typeof rawKey !== 'string') {
      throw new UnauthorizedException('A valid X-API-Key header is required');
    }

    const parts = rawKey.split('_');
    if (parts.length < 3 || parts[0] !== 'pk') {
      throw new UnauthorizedException('Invalid API key');
    }
    const keyPrefix = `${parts[0]}_${parts[1]}`;

    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyPrefix },
      include: { client: true },
    });
    if (
      !apiKey ||
      apiKey.status !== 'ACTIVE' ||
      apiKey.client.status !== 'ACTIVE' ||
      (apiKey.expiresAt && apiKey.expiresAt <= new Date())
    ) {
      throw new UnauthorizedException('Invalid or expired API key');
    }

    const actual = Buffer.from(createHash('sha256').update(rawKey).digest('hex'));
    const expected = Buffer.from(apiKey.keyHash);
    if (
      actual.length !== expected.length ||
      !timingSafeEqual(actual, expected)
    ) {
      throw new UnauthorizedException('Invalid API key');
    }

    const requiredScopes =
      this.reflector.getAllAndOverride<string[]>(API_SCOPES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];
    const availableScopes = new Set([
      ...apiKey.client.scopes,
      ...apiKey.scopes,
    ]);
    if (!requiredScopes.every((scope) => availableScopes.has(scope))) {
      throw new UnauthorizedException('API key does not have required scopes');
    }

    const rate = await this.rateLimits.consume(
      apiKey.id,
      apiKey.client.rateLimitPerMinute,
    );
    if (!rate.allowed) {
      throw new HttpException('Public API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }

    request.apiClient = apiKey.client;
    request.apiKey = apiKey;
    request.tenantId = apiKey.tenantId || apiKey.client.tenantId;
    request.organizationId =
      apiKey.organizationId || apiKey.client.organizationId;
    context.switchToHttp().getResponse().setHeader(
      'X-RateLimit-Remaining',
      String(rate.remaining),
    );

    void this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });
    return true;
  }
}
