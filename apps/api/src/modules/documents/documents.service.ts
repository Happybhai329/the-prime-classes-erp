import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UploadDocumentDto, QueryDocumentDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // ──────────────────────────────────────────────────
  // UPLOAD
  // ──────────────────────────────────────────────────

  async uploadDocument(
    tenantId: string,
    userId: string,
    dto: UploadDocumentDto,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Upload to MinIO
    const folder = `tenant-${tenantId}/docs`;
    const { key, size } = await this.storage.uploadFile(file, folder);

    // Save to DB
    const document = await this.prisma.document.create({
      data: {
        tenantId,
        title: dto.title,
        documentType: dto.documentType,
        fileUrl: key,
        fileSize: size,
        mimeType: file.mimetype,
        studentId: dto.studentId || null,
        uploadedBy: userId,
      },
      include: {
        uploader: { select: { email: true } },
        student: { select: { rollNumber: true } },
      },
    });

    this.logger.log(`Document uploaded: ${document.id} by user ${userId}`);
    return this.formatDocument(document);
  }

  // ──────────────────────────────────────────────────
  // LIST
  // ──────────────────────────────────────────────────

  async findAll(tenantId: string, query: QueryDocumentDto, studentIds: string[] = []) {
    const where: Prisma.DocumentWhereInput = {
      tenantId,
      ...(query.documentType && { documentType: query.documentType }),
      ...(query.studentId && { studentId: query.studentId }),
      ...(query.search && {
        title: { contains: query.search, mode: 'insensitive' as const },
      }),
    };

    // If studentIds provided (e.g. parent viewing only their kids' docs)
    if (studentIds.length > 0) {
      where.OR = [
        { studentId: null }, // Public docs
        { studentId: { in: studentIds } },
      ];
    }

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: {
          uploader: { select: { email: true } },
          student: { select: { firstName: true, lastName: true } },
        },
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: documents.map((d) => this.formatDocument(d)),
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  // ──────────────────────────────────────────────────
  // GET PRESIGNED URL
  // ──────────────────────────────────────────────────

  async getDownloadUrl(tenantId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });

    if (!document) throw new NotFoundException('Document not found');

    const url = await this.storage.getPresignedUrl(document.fileUrl);
    return { url };
  }

  // ──────────────────────────────────────────────────
  // DELETE
  // ──────────────────────────────────────────────────

  async remove(tenantId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });

    if (!document) throw new NotFoundException('Document not found');

    // Delete from MinIO
    await this.storage.deleteFile(document.fileUrl);

    // Delete from DB
    await this.prisma.document.delete({ where: { id } });

    return { success: true };
  }

  // ──────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────

  private formatDocument(doc: any) {
    return {
      id: doc.id,
      title: doc.title,
      documentType: doc.documentType,
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      version: doc.version,
      studentId: doc.studentId,
      studentName: doc.student ? `${doc.student.firstName} ${doc.student.lastName}` : null,
      uploadedBy: doc.uploadedBy,
      uploadedByName: doc.uploader?.email || 'Unknown',
      createdAt: doc.createdAt.toISOString(),
    };
  }
}
