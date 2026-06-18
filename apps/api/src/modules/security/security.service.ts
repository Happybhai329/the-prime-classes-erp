import { Injectable, NotFoundException } from '@nestjs/common';
import { authenticator } from 'otplib';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { SecretCipherService } from '../api-platform/secret-cipher.service';
import {
  CreateSsoDomainDto,
  CreateSsoProviderDto,
  RegisterTrustedDeviceDto,
  VerifyMfaDto,
} from './dto/security.dto';

@Injectable()
export class SecurityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cipher: SecretCipherService,
  ) {}

  async beginTotpEnrollment(tenantId: string, userId: string, email: string) {
    const secret = authenticator.generateSecret();
    const factor = await this.prisma.mfaFactor.create({
      data: {
        tenantId,
        userId,
        type: 'TOTP',
        status: 'PENDING',
        secretRef: this.cipher.encrypt(secret),
      },
    });
    return {
      factorId: factor.id,
      secret,
      otpauthUrl: authenticator.keyuri(email, 'Prime ERP', secret),
    };
  }

  async verifyTotpEnrollment(
    tenantId: string,
    userId: string,
    dto: VerifyMfaDto,
  ) {
    const factor = await this.prisma.mfaFactor.findFirst({
      where: {
        id: dto.factorId,
        tenantId,
        userId,
        type: 'TOTP',
        status: 'PENDING',
      },
    });
    if (!factor?.secretRef) {
      throw new NotFoundException('Pending MFA factor not found');
    }
    if (
      !authenticator.check(dto.code, this.cipher.decrypt(factor.secretRef))
    ) {
      throw new NotFoundException('Invalid MFA verification code');
    }

    return this.prisma.mfaFactor.update({
      where: { id: factor.id },
      data: { status: 'ACTIVE', lastUsedAt: new Date() },
    });
  }

  listMfaFactors(tenantId: string, userId: string) {
    return this.prisma.mfaFactor.findMany({
      where: { tenantId, userId },
      select: {
        id: true,
        type: true,
        status: true,
        phone: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  disableMfaFactor(tenantId: string, userId: string, factorId: string) {
    return this.prisma.mfaFactor.updateMany({
      where: { id: factorId, tenantId, userId },
      data: { status: 'DISABLED' },
    });
  }

  registerTrustedDevice(
    tenantId: string,
    userId: string,
    dto: RegisterTrustedDeviceDto,
    requestMeta: { ipAddress?: string; userAgent?: string },
  ) {
    return this.prisma.trustedDevice.upsert({
      where: {
        tenantId_userId_deviceId: {
          tenantId,
          userId,
          deviceId: dto.deviceId,
        },
      },
      update: {
        label: dto.label || null,
        platform: dto.platform || null,
        status: 'TRUSTED',
        revokedAt: null,
        ipAddress: requestMeta.ipAddress || null,
        userAgent: requestMeta.userAgent || null,
        lastSeenAt: new Date(),
      },
      create: {
        tenantId,
        userId,
        deviceId: dto.deviceId,
        label: dto.label || null,
        platform: dto.platform || null,
        ipAddress: requestMeta.ipAddress || null,
        userAgent: requestMeta.userAgent || null,
        lastSeenAt: new Date(),
      },
    });
  }

  listTrustedDevices(tenantId: string, userId: string) {
    return this.prisma.trustedDevice.findMany({
      where: { tenantId, userId },
      orderBy: { lastSeenAt: 'desc' },
    });
  }

  async revokeDevice(tenantId: string, userId: string, deviceId: string) {
    await this.prisma.$transaction([
      this.prisma.trustedDevice.updateMany({
        where: { tenantId, userId, deviceId },
        data: { status: 'REVOKED', revokedAt: new Date() },
      }),
      this.prisma.userSession.updateMany({
        where: { tenantId, userId, deviceId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return { revoked: true };
  }

  listSessions(tenantId: string, userId: string) {
    return this.prisma.userSession.findMany({
      where: { tenantId, userId },
      select: {
        id: true,
        deviceId: true,
        ipAddress: true,
        userAgent: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  revokeSession(tenantId: string, userId: string, sessionId: string) {
    return this.prisma.userSession.updateMany({
      where: { id: sessionId, tenantId, userId },
      data: { revokedAt: new Date() },
    });
  }

  createSsoProvider(dto: CreateSsoProviderDto) {
    return this.prisma.ssoProvider.create({
      data: {
        organizationId: dto.organizationId || null,
        tenantId: dto.tenantId || null,
        name: dto.name,
        protocol: dto.protocol as any,
        issuerUrl: dto.issuerUrl,
        clientId: dto.clientId,
        clientSecretRef: dto.clientSecretRef || null,
        config: (dto.config as any) || {},
      },
    });
  }

  listSsoProviders(organizationId?: string, tenantId?: string) {
    return this.prisma.ssoProvider.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(tenantId ? { tenantId } : {}),
      },
      include: { domains: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  createSsoDomain(dto: CreateSsoDomainDto) {
    return this.prisma.ssoDomain.create({
      data: {
        providerId: dto.providerId,
        organizationId: dto.organizationId || null,
        tenantId: dto.tenantId || null,
        domain: dto.domain.toLowerCase(),
        verificationToken: randomBytes(24).toString('hex'),
      },
    });
  }

  recordComplianceEvent(input: {
    organizationId?: string;
    tenantId?: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.complianceAuditEvent.create({
      data: {
        organizationId: input.organizationId || null,
        tenantId: input.tenantId || null,
        userId: input.userId || null,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId || null,
        metadata: (input.metadata as any) || {},
      },
    });
  }
}
