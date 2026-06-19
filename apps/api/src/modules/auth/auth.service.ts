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
import Redis from 'ioredis';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SecretCipherService } from '../api-platform/secret-cipher.service';
import { MailService } from './mail.service';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  tenantId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cipher: SecretCipherService,
    private readonly mailService: MailService,
  ) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
  }

  /**
   * Authenticate user with email + password.
   * Returns access token and refresh token.
   */
  async login(dto: LoginDto, ip: string = 'unknown') {
    const emailLower = dto.email.toLowerCase();
    const emailLockKey = `lockout:email:${emailLower}`;
    const ipLockKey = `lockout:ip:${ip}`;

    const [isEmailLocked, isIpLocked] = await Promise.all([
      this.isLocked(emailLockKey),
      this.isLocked(ipLockKey),
    ]);

    if (isEmailLocked || isIpLocked) {
      throw new UnauthorizedException('Too many failed login attempts. Please try again later.');
    }

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
      await this.registerFailedAttempt(dto.email, ip);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.registerFailedAttempt(dto.email, ip);
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
        await this.registerFailedAttempt(dto.email, ip);
        throw new UnauthorizedException('Invalid MFA code');
      }
      await this.prisma.mfaFactor.update({
        where: { id: activeMfa.id },
        data: { lastUsedAt: new Date() },
      });
    }

    // Clear failed login tracking on success
    await this.clearFailedAttempts(dto.email, ip);

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

    this.validatePasswordComplexity(dto.newPassword);
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
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
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
      // Return success anyway to prevent email enumeration
      return {
        message: 'If an account exists with that identifier, an OTP has been sent.',
      };
    }

    // Rate limiting: check if OTP was requested within last 2 minutes
    if (user.passwordResetExpiry) {
      const timeSinceLastRequest = Date.now() - user.passwordResetExpiry.getTime() + (15 * 60 * 1000);
      if (timeSinceLastRequest < 2 * 60 * 1000) {
        return {
          message: 'If an account exists with that identifier, an OTP has been sent.',
        };
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedOtp,
        passwordResetExpiry: expiry,
      },
    });

    this.logger.log(`[PASSWORD RESET SYSTEM] Generated OTP for user ${user.email}`);

    // Send OTP via SMTP
    await this.mailService.sendPasswordResetOtpEmail(user.email, otp);

    return {
      message: 'If an account exists with that identifier, an OTP has been sent.',
    };
  }

  /**
   * Step 2: Verify OTP — validates the OTP is correct and not expired.
   */
  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone: email }],
        deletedAt: null,
      },
    });

    if (!user || !user.passwordResetToken || !user.passwordResetExpiry) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Check expiry
    if (new Date() > user.passwordResetExpiry) {
      // Clear expired token
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken: null, passwordResetExpiry: null },
      });
      throw new UnauthorizedException('OTP has expired. Please request a new one.');
    }

    // Verify hashed OTP
    const isOtpValid = await bcrypt.compare(otp, user.passwordResetToken);
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    this.logger.log(`[PASSWORD RESET SYSTEM] OTP verified for user ${user.email}`);

    return {
      message: 'OTP verified successfully. You may now reset your password.',
      verified: true,
    };
  }

  /**
   * Step 3: Reset Password — verifies OTP again and sets new password.
   */
  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone: email }],
        deletedAt: null,
      },
    });

    if (!user || !user.passwordResetToken || !user.passwordResetExpiry) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Check expiry
    if (new Date() > user.passwordResetExpiry) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken: null, passwordResetExpiry: null },
      });
      throw new UnauthorizedException('OTP has expired. Please request a new one.');
    }

    // Verify hashed OTP
    const isOtpValid = await bcrypt.compare(otp, user.passwordResetToken);
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    this.validatePasswordComplexity(newPassword);
    // Hash new password and clear reset tokens
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
          passwordResetToken: null,
          passwordResetExpiry: null,
          refreshTokenHash: null, // Force re-login on all devices
        },
      }),
      // Revoke all active sessions
      this.prisma.userSession.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    this.logger.log(`[PASSWORD RESET SYSTEM] Password reset completed for user ${user.email}`);

    return {
      message: 'Password has been reset successfully. Please login with your new password.',
    };
  }

  private validatePasswordComplexity(password: string): void {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new UnauthorizedException(
        'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      );
    }
  }

  private async isLocked(key: string): Promise<boolean> {
    try {
      if (this.redis.status === 'wait') {
        await this.redis.connect();
      }
      const locked = await this.redis.get(key);
      return locked === '1';
    } catch {
      return false; // Fallback to not locking if Redis fails
    }
  }

  private async registerFailedAttempt(email: string, ip: string) {
    const emailLower = email.toLowerCase();
    const attemptsEmailKey = `attempts:email:${emailLower}`;
    const attemptsIpKey = `attempts:ip:${ip}`;
    const emailLockKey = `lockout:email:${emailLower}`;
    const ipLockKey = `lockout:ip:${ip}`;

    try {
      if (this.redis.status === 'wait') {
        await this.redis.connect();
      }

      const [attemptsEmail, attemptsIp] = await Promise.all([
        this.redis.incr(attemptsEmailKey),
        this.redis.incr(attemptsIpKey),
      ]);

      // Set expiry for attempts window (15 minutes)
      if (attemptsEmail === 1) await this.redis.expire(attemptsEmailKey, 900);
      if (attemptsIp === 1) await this.redis.expire(attemptsIpKey, 900);

      // Lockout conditions: 5 attempts for email, 10 attempts for IP
      if (attemptsEmail >= 5) {
        await this.redis.set(emailLockKey, '1', 'EX', 900); // 15 mins lockout
        this.logger.warn(`Brute force lockout: email ${emailLower} locked for 15 minutes.`);
      }
      if (attemptsIp >= 10) {
        await this.redis.set(ipLockKey, '1', 'EX', 1800); // 30 mins lockout for IP
        this.logger.warn(`Brute force lockout: IP ${ip} locked for 30 minutes.`);
      }
    } catch (err: any) {
      this.logger.error('Failed to register failed login attempt in Redis', err?.stack);
    }
  }

  private async clearFailedAttempts(email: string, ip: string) {
    const emailLower = email.toLowerCase();
    try {
      if (this.redis.status === 'wait') {
        await this.redis.connect();
      }
      await this.redis.del(
        `attempts:email:${emailLower}`,
        `attempts:ip:${ip}`,
        `lockout:email:${emailLower}`,
        `lockout:ip:${ip}`
      );
    } catch (err: any) {
      this.logger.error('Failed to clear failed login attempts in Redis', err?.stack);
    }
  }
}

