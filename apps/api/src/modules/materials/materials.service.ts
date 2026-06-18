import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMaterialDto, UpdateMaterialDto, QueryMaterialDto, CreateCategoryDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';
import { NotificationType } from '@prime/shared-types';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly notifications: NotificationsService,
  ) {}

  // ──────────────────────────────────────────────────
  // CATEGORIES
  // ──────────────────────────────────────────────────

  async createCategory(tenantId: string, dto: CreateCategoryDto) {
    const existing = await this.prisma.materialCategory.findFirst({
      where: { tenantId, name: { equals: dto.name, mode: 'insensitive' } },
    });

    if (existing) {
      throw new BadRequestException('Category with this name already exists');
    }

    return this.prisma.materialCategory.create({
      data: {
        tenantId,
        name: dto.name,
      },
    });
  }

  async findCategories(tenantId: string) {
    return this.prisma.materialCategory.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  // ──────────────────────────────────────────────────
  // MATERIALS CRUD & UPLOAD
  // ──────────────────────────────────────────────────

  async uploadMaterial(
    tenantId: string,
    userId: string,
    dto: CreateMaterialDto,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required for upload');
    }

    // 1. Upload to MinIO
    const folder = `tenant-${tenantId}/materials`;
    const { key, size } = await this.storage.uploadFile(file, folder);

    // 2. Write to DB inside transaction
    const material = await this.prisma.$transaction(async (tx) => {
      const mat = await tx.material.create({
        data: {
          tenantId,
          categoryId: dto.categoryId || null,
          batchId: dto.batchId || null,
          subjectId: dto.subjectId || null,
          course: dto.course || null,
          chapter: dto.chapter || null,
          topic: dto.topic || null,
          title: dto.title,
          description: dto.description || null,
          fileUrl: key,
          fileSize: size,
          mimeType: file.mimetype,
          uploadedBy: userId,
          version: 1,
          isPublished: dto.isPublished !== undefined ? dto.isPublished : true,
        },
      });

      // Create initial version history
      await tx.materialVersion.create({
        data: {
          materialId: mat.id,
          version: 1,
          fileUrl: key,
          fileSize: size,
          uploadedBy: userId,
        },
      });

      return mat;
    });

    this.logger.log(`Material uploaded: ${material.id} by user ${userId}`);

    // 3. Trigger notification for enrolled students
    try {
      await this.triggerNewMaterialNotification(tenantId, material);
    } catch (err) {
      this.logger.error(`Notification failed: ${err}`);
    }

    return material;
  }

  async updateMaterial(
    tenantId: string,
    id: string,
    userId: string,
    dto: UpdateMaterialDto,
    file?: Express.Multer.File,
  ) {
    const material = await this.prisma.material.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return this.prisma.$transaction(async (tx) => {
      let fileUrl = material.fileUrl;
      let fileSize = material.fileSize;
      let mimeType = material.mimeType;
      let nextVersion = material.version;

      if (file) {
        // New file version upload
        const folder = `tenant-${tenantId}/materials`;
        const upload = await this.storage.uploadFile(file, folder);
        fileUrl = upload.key;
        fileSize = upload.size;
        mimeType = file.mimetype;
        nextVersion += 1;

        // Save new version history
        await tx.materialVersion.create({
          data: {
            materialId: material.id,
            version: nextVersion,
            fileUrl,
            fileSize,
            uploadedBy: userId,
          },
        });
      }

      return tx.material.update({
        where: { id },
        data: {
          title: dto.title !== undefined ? dto.title : material.title,
          description: dto.description !== undefined ? dto.description : material.description,
          categoryId: dto.categoryId !== undefined ? dto.categoryId : material.categoryId,
          batchId: dto.batchId !== undefined ? dto.batchId : material.batchId,
          subjectId: dto.subjectId !== undefined ? dto.subjectId : material.subjectId,
          course: dto.course !== undefined ? dto.course : material.course,
          chapter: dto.chapter !== undefined ? dto.chapter : material.chapter,
          topic: dto.topic !== undefined ? dto.topic : material.topic,
          isPublished: dto.isPublished !== undefined ? dto.isPublished : material.isPublished,
          fileUrl,
          fileSize,
          mimeType,
          version: nextVersion,
        },
      });
    });
  }

  async findMaterials(tenantId: string, query: QueryMaterialDto, userContext?: { role: string; studentId?: string; userId: string }) {
    const where: Prisma.MaterialWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.subjectId && { subjectId: query.subjectId }),
      ...(query.course && { course: { contains: query.course, mode: 'insensitive' } }),
      ...(query.chapter && { chapter: { contains: query.chapter, mode: 'insensitive' } }),
      ...(query.topic && { topic: { contains: query.topic, mode: 'insensitive' } }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    // Role-based filtering
    if (userContext) {
      if (userContext.role === 'STUDENT' && userContext.studentId) {
        where.isPublished = true;
        // Find student's batches
        const enrollments = await this.prisma.batchStudent.findMany({
          where: { studentId: userContext.studentId, status: 'ACTIVE' },
          select: { batchId: true },
        });
        const batchIds = enrollments.map(e => e.batchId);
        where.OR = [
          { batchId: null }, // Public library
          ...(batchIds.length > 0 ? [{ batchId: { in: batchIds } }] : []),
        ];

        // Star / Favorite filters
        if (query.favoritesOnly) {
          where.favorites = {
            some: { studentId: userContext.studentId },
          };
        }

        // Recently accessed filter
        if (query.recentlyAccessed) {
          where.accessLogs = {
            some: { userId: userContext.userId },
          };
        }
      } else if (userContext.role === 'PARENT' && userContext.studentId) {
        where.isPublished = true;
        // Same as student batch restrictions for parents viewing children's library
        const enrollments = await this.prisma.batchStudent.findMany({
          where: { studentId: userContext.studentId, status: 'ACTIVE' },
          select: { batchId: true },
        });
        const batchIds = enrollments.map(e => e.batchId);
        where.OR = [
          { batchId: null },
          ...(batchIds.length > 0 ? [{ batchId: { in: batchIds } }] : []),
        ];
      } else {
        // Faculty & Admin filter
        if (query.batchId) {
          where.batchId = query.batchId;
        }
        if (query.isPublished !== undefined) {
          where.isPublished = query.isPublished;
        }
      }
    }

    const [materials, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          batch: { select: { id: true, name: true, code: true } },
          subject: { select: { id: true, name: true, code: true } },
          uploader: { select: { email: true, role: true } },
          _count: { select: { accessLogs: true, favorites: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.material.count({ where }),
    ]);

    return {
      data: materials,
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  async findOne(tenantId: string, id: string) {
    const material = await this.prisma.material.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        category: true,
        batch: true,
        subject: true,
        versions: {
          orderBy: { version: 'desc' },
          include: { uploader: { select: { email: true } } },
        },
      },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return material;
  }

  // ──────────────────────────────────────────────────
  // ACCESS LOGS & PRESIGNED URLS
  // ──────────────────────────────────────────────────

  async getPresignedUrl(
    tenantId: string,
    id: string,
    userId: string,
    action: 'PREVIEW' | 'DOWNLOAD',
    ipAddress?: string,
    userAgent?: string,
  ) {
    const material = await this.prisma.material.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    // Generate pre-signed URL from MinIO
    const url = await this.storage.getPresignedUrl(material.fileUrl);

    // Audit log this access
    await this.prisma.materialAccessLog.create({
      data: {
        tenantId,
        materialId: id,
        userId,
        action,
        ipAddress,
        userAgent,
      },
    });

    return { url };
  }

  async getAccessLogs(tenantId: string, id: string) {
    return this.prisma.materialAccessLog.findMany({
      where: {
        materialId: id,
        tenant: { id: tenantId },
      },
      include: {
        user: { select: { email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ──────────────────────────────────────────────────
  // FAVORITES
  // ──────────────────────────────────────────────────

  async toggleFavorite(tenantId: string, id: string, studentId: string) {
    const material = await this.prisma.material.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    const fav = await this.prisma.materialFavorite.findUnique({
      where: { studentId_materialId: { studentId, materialId: id } },
    });

    if (fav) {
      await this.prisma.materialFavorite.delete({
        where: { id: fav.id },
      });
      return { favorited: false };
    } else {
      await this.prisma.materialFavorite.create({
        data: {
          materialId: id,
          studentId,
        },
      });
      return { favorited: true };
    }
  }

  // ──────────────────────────────────────────────────
  // SOFT DELETE
  // ──────────────────────────────────────────────────

  async remove(tenantId: string, id: string) {
    const material = await this.prisma.material.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    await this.prisma.material.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  // ──────────────────────────────────────────────────
  // PRIVATE NOTIFICATION TRIGGER
  // ──────────────────────────────────────────────────

  private async triggerNewMaterialNotification(tenantId: string, material: any) {
    if (!material.isPublished) return;

    let targetIds: string[] = [];

    if (material.batchId) {
      // Notify active students of this batch
      const students = await this.prisma.student.findMany({
        where: { tenantId, batchEnrollments: { some: { batchId: material.batchId, status: 'ACTIVE' } } },
        select: { userId: true },
      });
      targetIds = students.map(s => s.userId).filter(id => id);
    } else {
      // Global library notification (notify all students)
      const students = await this.prisma.student.findMany({
        where: { tenantId, status: 'ACTIVE' },
        select: { userId: true },
      });
      targetIds = students.map(s => s.userId).filter(id => id);
    }

    if (targetIds.length > 0) {
      await this.notifications.create(tenantId, {
        title: 'New Study Material Uploaded',
        body: `"${material.title}" has been uploaded to your library.`,
        type: NotificationType.ANNOUNCEMENT,
        targetIds,
        data: { materialId: material.id },
      });
    }
  }
}
