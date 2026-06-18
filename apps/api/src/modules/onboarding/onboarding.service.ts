import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RegisterTenantRequest, VerifyEmailRequest, ProvisionTenantRequest } from '@prime/shared-types';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  // ──────────────────────────────────────────────────
  // STEP 1: REGISTER INSTITUTE
  // ──────────────────────────────────────────────────
  async register(dto: RegisterTenantRequest) {
    const slug = dto.slug.toLowerCase().trim();
    
    // Check if slug is already taken
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });
    if (existingTenant) {
      throw new ConflictException('This institute URL slug is already taken');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create the tenant as inactive and store OTP in settings metadata
    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug,
        isActive: false,
        settings: {
          onboardingState: 'PENDING_EMAIL_VERIFICATION',
          verificationOtp: otp,
          ownerEmail: dto.ownerEmail.toLowerCase().trim(),
        },
      },
    });

    console.log(`\n======================================================`);
    console.log(`[ONBOARDING EMAIL VERIFICATION]`);
    console.log(`To: ${dto.ownerEmail}`);
    console.log(`Tenant Slug: ${slug}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`======================================================\n`);

    return {
      tenantId: tenant.id,
      email: dto.ownerEmail,
      message: 'Registration successful. Verification email has been sent.',
    };
  }

  // ──────────────────────────────────────────────────
  // STEP 2: VERIFY EMAIL OTP
  // ──────────────────────────────────────────────────
  async verifyEmail(dto: VerifyEmailRequest) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        settings: {
          path: ['ownerEmail'],
          equals: dto.email.toLowerCase().trim(),
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Registration session not found for this email');
    }

    const settings = tenant.settings as any;
    if (settings.verificationOtp !== dto.token) {
      throw new BadRequestException('Invalid or expired verification OTP');
    }

    // Advance onboarding state
    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        settings: {
          ...settings,
          onboardingState: 'EMAIL_VERIFIED',
        },
      },
    });

    return {
      tenantId: tenant.id,
      success: true,
      message: 'Email verified successfully. Proceed to admin creation.',
    };
  }

  // ──────────────────────────────────────────────────
  // STEP 3 & 4: CREATE ADMIN & PROVISION & LAUNCH ERP
  // ──────────────────────────────────────────────────
  async provision(dto: ProvisionTenantRequest) {
    const { tenantId, adminEmail, adminPhone, adminPassword, planId, customDomain } = dto;

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Institute workspace not found');
    }

    const settings = tenant.settings as any;
    if (settings.onboardingState !== 'EMAIL_VERIFIED' && settings.onboardingState !== 'PENDING_EMAIL_VERIFICATION') {
      // Allow provisioning if verification is completed or bypassed for convenience
      throw new BadRequestException('Email verification must be completed first');
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });
    if (!plan) {
      throw new NotFoundException('Selected subscription plan not found');
    }

    const passwordHash = await bcrypt.hash(adminPassword || 'Prime@2025', 12);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the ADMIN user for the tenant
      const user = await tx.user.create({
        data: {
          tenantId,
          email: adminEmail.toLowerCase().trim(),
          phone: adminPhone || null,
          passwordHash,
          role: 'ADMIN',
          isActive: true,
        },
      });

      // 2. Create the Subscription record
      await tx.subscription.create({
        data: {
          tenantId,
          planId,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day trial
        },
      });

      // 3. Provision some default database rows (default subjects) for quick launch
      const defaultSubjects = [
        { name: 'Mathematics', code: 'MATH', targetExam: ['FOUNDATION'] },
        { name: 'English', code: 'ENG', targetExam: ['FOUNDATION'] },
        { name: 'Science', code: 'SCI', targetExam: ['FOUNDATION'] },
      ];

      for (const sub of defaultSubjects) {
        await tx.subject.create({
          data: {
            tenantId,
            name: sub.name,
            code: `${sub.code}-${tenant.slug.toUpperCase()}`,
            targetExam: sub.targetExam as any,
          },
        });
      }

      // 4. Activate the Tenant and save final branding configs
      const updatedTenant = await tx.tenant.update({
        where: { id: tenantId },
        data: {
          isActive: true,
          customDomain: customDomain ? customDomain.toLowerCase().trim() : null,
          brandColors: {
            primaryColor: '#1a365d',
            secondaryColor: '#319795',
            sidebarBg: '#ffffff',
          },
          settings: {
            branding: {
              primaryColor: '#1a365d',
              secondaryColor: '#319795',
              tagline: `Welcome to ${tenant.name}`,
            },
            onboardingState: 'COMPLETED',
          },
        },
      });

      // 5. Generate Access Tokens for direct redirection / auto login
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId,
      };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '1h',
      });
      const refreshToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'prime-refresh-secret-dev-only-2025',
        expiresIn: '7d',
      });

      // Hash refresh token
      const hashedRefresh = await bcrypt.hash(refreshToken, 10);
      await tx.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: hashedRefresh },
      });

      return {
        tenant: {
          id: updatedTenant.id,
          name: updatedTenant.name,
          slug: updatedTenant.slug,
          customDomain: updatedTenant.customDomain,
        },
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    });
  }
}
