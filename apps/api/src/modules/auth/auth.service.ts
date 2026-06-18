import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SecretCipherService } from '../api-platform/secret-cipher.service';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  tenantId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cipher: SecretCipherService,
  ) {}

  /**
   * Authenticate user with email + password.
   * Returns access token and refresh token.
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { phone: dto.email },
        ],
        deletedAt: null,
      },
      include: {
        student: true,
        parent: true,
        faculty: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const activeMfa = await this.prisma.mfaFactor.findFirst({
      where: {
        userId: user.id,
        tenantId: user.tenantId,
        type: 'TOTP',
        status: 'ACTIVE',
      },
    });
    if (activeMfa) {
      if (!dto.mfaCode || !activeMfa.secretRef) {
        throw new UnauthorizedException('MFA code required');
      }
      const isMfaValid = authenticator.check(
        dto.mfaCode,
        this.cipher.decrypt(activeMfa.secretRef),
      );
      if (!isMfaValid) {
        throw new UnauthorizedException('Invalid MFA code');
      }
      await this.prisma.mfaFactor.update({
        where: { id: activeMfa.id },
        data: { lastUsedAt: new Date() },
      });
    }

    // Generate tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    const decoded = this.jwtService.decode(refreshToken) as {
      exp?: number;
    } | null;
    await this.prisma.userSession.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        refreshTokenHash: await bcrypt.hash(refreshToken, 10),
        deviceId: dto.deviceId || null,
        expiresAt: decoded?.exp
          ? new Date(decoded.exp * 1000)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    this.logger.log(`User logged in: ${user.email} (${user.role})`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
        lastLogin: user.lastLogin?.toISOString() || null,
        student: user.student
          ? {
              id: user.student.id,
              rollNumber: user.student.rollNumber,
              firstName: user.student.firstName,
              lastName: user.student.lastName,
              status: user.student.status,
              targetExam: user.student.targetExam,
            }
          : undefined,
        parent: user.parent
          ? {
              id: user.parent.id,
              fatherName: user.parent.fatherName,
              motherName: user.parent.motherName,
              fatherPhone: user.parent.fatherPhone,
              motherPhone: user.parent.motherPhone,
            }
          : undefined,
        faculty: user.faculty
          ? {
              id: user.faculty.id,
              employeeId: user.faculty.employeeId,
              firstName: user.faculty.firstName,
              lastName: user.faculty.lastName,
              specialization: user.faculty.specialization,
            }
          : undefined,
      },
    };
  }

  /**
   * Refresh access token using a valid refresh token.
   */
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshTokenHash || !user.isActive) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = this.generateAccessToken(payload);
    const newRefreshToken = await this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout — invalidate refresh token.
   */
  async logout(userId: string) {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash: null },
      }),
      this.prisma.userSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  /**
   * Change password for authenticated user.
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        refreshTokenHash: null, // Force re-login on all devices
      },
    });

    await this.prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Get current user profile.
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        parent: true,
        faculty: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, refreshTokenHash, passwordResetToken, passwordResetExpiry, ...profile } = user;
    return profile;
  }

  // --- Private helpers ---

  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRY', '7d'),
    });

    // Store hashed refresh token in DB
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { refreshTokenHash: hashedRefreshToken },
    });

    return refreshToken;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone: email }],
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found with the provided identifier');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: otp,
        passwordResetExpiry: expiry,
      },
    });

    this.logger.log(`[PASSWORD RESET SYSTEM] Generated OTP for user ${user.email}: ${otp}`);

    return {
      message: 'Password reset OTP has been generated successfully',
      token: otp, // Returned for dev testing ease
    };
  }
}
