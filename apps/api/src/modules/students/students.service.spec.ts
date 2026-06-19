import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('StudentsService', () => {
  let service: StudentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    student: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne - Tenant Isolation', () => {
    it('should return the student if it belongs to the tenant', async () => {
      const mockStudent = {
        id: 'student-123',
        tenantId: 'tenant-abc',
        firstName: 'John',
        lastName: 'Doe',
        deletedAt: null,
      };

      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);

      const result = await service.findOne('tenant-abc', 'student-123');
      expect(result).toBeDefined();
      expect(result.id).toBe('student-123');
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'student-123', tenantId: 'tenant-abc', deletedAt: null },
        }),
      );
    });

    it('should throw NotFoundException if student belongs to another tenant', async () => {
      // prisma returns null because of where clause mismatch (different tenant)
      mockPrisma.student.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('tenant-other', 'student-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll - Tenant Isolation', () => {
    it('should filter query results by tenantId', async () => {
      await service.findAll('tenant-abc', { page: 1, limit: 10, skip: 0, take: 10 });

      expect(mockPrisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-abc',
            deletedAt: null,
          }),
        }),
      );
    });
  });
});
