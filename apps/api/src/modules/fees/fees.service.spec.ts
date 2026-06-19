import { Test, TestingModule } from '@nestjs/testing';
import { StudentFeesService } from './services/student-fees.service';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotFoundException } from '@nestjs/common';

describe('StudentFeesService', () => {
  let service: StudentFeesService;
  let prisma: PrismaService;

  const mockPrisma: any = {
    feeStructure: {
      findFirst: jest.fn(),
    },
    student: {
      findFirst: jest.fn(),
    },
    studentFee: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
    },
    feeInstallment: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };

  const mockAudit = {
    logAction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentFeesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<StudentFeesService>(StudentFeesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assign - Tenant Isolation', () => {
    it('should throw NotFoundException if fee structure belongs to another tenant', async () => {
      // Mock feeStructure lookup to return null (not found for this tenantId)
      mockPrisma.feeStructure.findFirst.mockResolvedValue(null);

      await expect(
        service.assign('tenant-abc', 'user-1', {
          studentId: 'student-1',
          feeStructureId: 'fee-structure-1',
          academicYear: '2026-2027',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.feeStructure.findFirst).toHaveBeenCalledWith({
        where: { id: 'fee-structure-1', tenantId: 'tenant-abc', isActive: true },
      });
    });

    it('should throw NotFoundException if student belongs to another tenant', async () => {
      // Mock feeStructure lookup to succeed for tenant-abc
      mockPrisma.feeStructure.findFirst.mockResolvedValue({ id: 'fee-structure-1', totalFee: '5000' });
      // Mock student lookup to return null (not found for tenant-abc)
      mockPrisma.student.findFirst.mockResolvedValue(null);

      await expect(
        service.assign('tenant-abc', 'user-1', {
          studentId: 'student-1',
          feeStructureId: 'fee-structure-1',
          academicYear: '2026-2027',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { id: 'student-1', tenantId: 'tenant-abc', deletedAt: null },
      });
    });
  });

  describe('findOneById - Tenant Isolation', () => {
    it('should throw NotFoundException if student fee record is not found for tenant', async () => {
      mockPrisma.studentFee.findFirst.mockResolvedValue(null);

      await expect(
        service.findOneById('tenant-other', 'student-fee-123'),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.studentFee.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'student-fee-123', tenantId: 'tenant-other', deletedAt: null },
        }),
      );
    });
  });
});
