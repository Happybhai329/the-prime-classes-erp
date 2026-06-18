import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { Queue } from 'bull';
import { PrismaService } from '../../database/prisma.service';
import {
  WEBHOOK_DELIVERY_JOB,
  WEBHOOK_QUEUE,
} from './api-platform.constants';
import {
  CreateApiClientDto,
  CreateApiKeyDto,
  CreateWebhookEndpointDto,
  PublishWebhookEventDto,
} from './dto/api-platform.dto';
import { SecretCipherService } from './secret-cipher.service';

@Injectable()
export class ApiPlatformService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cipher: SecretCipherService,
    @InjectQueue(WEBHOOK_QUEUE) private readonly webhookQueue: Queue,
  ) {}

  createClient(userId: string, dto: CreateApiClientDto) {
    return this.prisma.apiClient.create({
      data: {
        organizationId: dto.organizationId || null,
        tenantId: dto.tenantId || null,
        name: dto.name,
        description: dto.description || null,
        scopes: dto.scopes,
        rateLimitPerMinute: dto.rateLimitPerMinute,
        createdBy: userId,
      },
    });
  }

  listClients(organizationId?: string, tenantId?: string) {
    return this.prisma.apiClient.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(tenantId ? { tenantId } : {}),
      },
      include: {
        keys: {
          select: {
            id: true,
            keyPrefix: true,
            status: true,
            scopes: true,
            lastUsedAt: true,
            expiresAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createKey(clientId: string, userId: string, dto: CreateApiKeyDto) {
    const client = await this.prisma.apiClient.findUnique({
      where: { id: clientId },
    });
    if (!client) {
      throw new NotFoundException('API client not found');
    }

    const prefix = `pk_${randomBytes(6).toString('hex')}`;
    const secret = `${prefix}_${randomBytes(24).toString('base64url')}`;
    const keyHash = createHash('sha256').update(secret).digest('hex');
    const apiKey = await this.prisma.apiKey.create({
      data: {
        clientId,
        organizationId: client.organizationId,
        tenantId: client.tenantId,
        keyPrefix: prefix,
        keyHash,
        scopes: dto.scopes,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        createdBy: userId,
      },
    });

    return { ...apiKey, secret };
  }

  revokeKey(keyId: string) {
    return this.prisma.apiKey.update({
      where: { id: keyId },
      data: { status: 'REVOKED' },
    });
  }

  async createWebhookEndpoint(dto: CreateWebhookEndpointDto) {
    const secret = randomBytes(32).toString('base64url');
    const endpoint = await this.prisma.webhookEndpoint.create({
      data: {
        clientId: dto.clientId || null,
        organizationId: dto.organizationId || null,
        tenantId: dto.tenantId || null,
        url: dto.url,
        secretHash: createHash('sha256').update(secret).digest('hex'),
        secretEncrypted: this.cipher.encrypt(secret),
        eventTypes: dto.eventTypes,
      },
    });
    return { ...endpoint, secret };
  }

  listWebhookEndpoints(organizationId?: string, tenantId?: string) {
    return this.prisma.webhookEndpoint.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(tenantId ? { tenantId } : {}),
      },
      select: {
        id: true,
        clientId: true,
        organizationId: true,
        tenantId: true,
        url: true,
        eventTypes: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async publishWebhookEvent(dto: PublishWebhookEventDto) {
    if (dto.idempotencyKey) {
      const existing = await this.prisma.webhookEvent.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) return existing;
    }

    const event = await this.prisma.webhookEvent.create({
      data: {
        organizationId: dto.organizationId || null,
        tenantId: dto.tenantId || null,
        eventType: dto.eventType,
        payload: dto.payload as any,
        idempotencyKey: dto.idempotencyKey || null,
      },
    });

    const endpoints = await this.prisma.webhookEndpoint.findMany({
      where: {
        isActive: true,
        eventTypes: { has: dto.eventType },
        ...(dto.tenantId
          ? { OR: [{ tenantId: dto.tenantId }, { tenantId: null }] }
          : {}),
        ...(dto.organizationId
          ? {
              AND: {
                OR: [
                  { organizationId: dto.organizationId },
                  { organizationId: null },
                ],
              },
            }
          : {}),
      },
    });

    for (const endpoint of endpoints) {
      const delivery = await this.prisma.webhookDelivery.create({
        data: { eventId: event.id, endpointId: endpoint.id },
      });
      await this.webhookQueue.add(
        WEBHOOK_DELIVERY_JOB,
        { deliveryId: delivery.id },
        {
          jobId: `webhook:${delivery.id}`,
          attempts: 5,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 500,
          removeOnFail: 1000,
        },
      );
    }

    return this.prisma.webhookEvent.update({
      where: { id: event.id },
      data: { status: 'DISPATCHED' },
    });
  }
}
