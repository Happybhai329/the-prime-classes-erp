import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SecretCipherService } from '../api-platform/secret-cipher.service';
import { MailService } from './mail.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock ioredis to prevent real connections
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      on: jest.fn(),
      defineCommand: jest.fn(),
    };
  });
});

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
    },
    mfaFactor: {
      findFirst: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  const mockConfig = {
    get: jest.fn((key: string, defaultValue?: any) => {
      if (key === 'REDIS_HOST') return 'localhost';
      if (key === 'REDIS_PORT') return 6379;
      return defaultValue;
    }),
    getOrThrow: jest.fn((key: string) => {
      if (key === 'JWT_REFRESH_SECRET') return 'mock-secret';
      return 'mock-val';
    }),
  };

  const mockCipher = {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  };

  const mockMail = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: SecretCipherService, useValue: mockCipher },
        { provide: MailService, useValue: mockMail },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if password hash mismatch', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('correct-password', 10),
        isActive: true,
        tenantId: 'tenant-1',
        role: 'STUDENT',
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      // We expect this to fail since password is wrong
      await expect(
        service.login({ email: 'test@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user account is deactivated', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'inactive@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        isActive: false,
        tenantId: 'tenant-1',
        role: 'STUDENT',
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'inactive@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
