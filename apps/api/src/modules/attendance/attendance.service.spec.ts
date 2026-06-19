import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AttendanceSessionType } from '@prime/shared-types';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let prisma: PrismaService;

  const mockPrisma: any = {
    batch: {
      findFirst: jest.fn(),
    },
    subject: {
      findFirst: jest.fn(),
    },
    attendanceSession: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn(),
      create: jest.fn(),
    },
    attendanceRecord: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession - Tenant Isolation', () => {
    it('should throw NotFoundException if the batch does not belong to the tenant', async () => {
      // Mock batch lookup to return null (meaning batch not found for this tenant)
      mockPrisma.batch.findFirst.mockResolvedValue(null);

      await expect(
        service.createSession('tenant-abc', 'user-1', {
          batchId: 'batch-1',
          sessionDate: '2026-06-19',
          sessionType: AttendanceSessionType.MORNING,
          records: [],
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.batch.findFirst).toHaveBeenCalledWith({
        where: { id: 'batch-1', tenantId: 'tenant-abc', isActive: true },
      });
    });
  });

  describe('finalizeSession - Tenant Isolation', () => {
    it('should throw NotFoundException if the session belongs to a different tenant', async () => {
      // Mock session lookup to return null because tenantId is mismatched
      mockPrisma.attendanceSession.findFirst.mockResolvedValue(null);

      await expect(
        service.finalizeSession('tenant-other', 'session-123'),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.attendanceSession.findFirst).toHaveBeenCalledWith({
        where: { id: 'session-123', tenantId: 'tenant-other' },
      });
    });

    it('should finalize session if it belongs to the tenant', async () => {
      const mockSession = {
        id: 'session-123',
        tenantId: 'tenant-abc',
        isFinalized: false,
      };

      mockPrisma.attendanceSession.findFirst.mockResolvedValue(mockSession);
      mockPrisma.attendanceSession.update.mockResolvedValue({ ...mockSession, isFinalized: true });

      const result = await service.finalizeSession('tenant-abc', 'session-123');
      expect(result.message).toBe('Session finalized successfully');
      expect(mockPrisma.attendanceSession.update).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        data: { isFinalized: true },
      });
    });
  });
});
