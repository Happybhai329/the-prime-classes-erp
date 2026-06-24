import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateAssignmentDto, UpdateAssignmentDto, QueryAssignmentDto, GradeSubmissionDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';
import { NotificationType, SubmissionStatus, AchievementType } from '@prime/shared-types';

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly notifications: NotificationsService,
  ) {}

  // ──────────────────────────────────────────────────
  // ASSIGNMENT CRUD
  // ──────────────────────────────────────────────────

  async create(
    tenantId: string,
    userId: string,
    dto: CreateAssignmentDto,
    file?: Express.Multer.File,
  ) {
    let fileUrl: string | null = null;

    if (file) {
      const folder = `tenant-${tenantId}/assignments/attachments`;
      const upload = await this.storage.uploadFile(file, folder);
      fileUrl = upload.key;
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        tenantId,
        batchId: dto.batchId,
        subjectId: dto.subjectId,
        title: dto.title,
        description: dto.description || null,
        fileUrl,
        deadline: new Date(dto.deadline),
        createdBy: userId,
        type: dto.type || 'ASSIGNMENT',
        isPublished: dto.isPublished !== undefined ? dto.isPublished : true,
      },
      include: {
        batch: { select: { name: true } },
        subject: { select: { name: true } },
      },
    });

    this.logger.log(`Assignment created: ${assignment.id} for batch ${dto.batchId}`);

    // Trigger Notification for batch students only if published
    if (assignment.isPublished) {
      try {
        await this.triggerNewAssignmentNotification(tenantId, assignment);
      } catch (err) {
        this.logger.error(`Notification failed: ${err}`);
      }
    }

    return assignment;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateAssignmentDto,
    file?: Express.Multer.File,
  ) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');

    let fileUrl = assignment.fileUrl;

    if (file) {
      // If there was an old file, delete it
      if (assignment.fileUrl) {
        try {
          await this.storage.deleteFile(assignment.fileUrl);
        } catch {}
      }

      const folder = `tenant-${tenantId}/assignments/attachments`;
      const upload = await this.storage.uploadFile(file, folder);
      fileUrl = upload.key;
    }

    return this.prisma.assignment.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title : assignment.title,
        description: dto.description !== undefined ? dto.description : assignment.description,
        batchId: dto.batchId !== undefined ? dto.batchId : assignment.batchId,
        subjectId: dto.subjectId !== undefined ? dto.subjectId : assignment.subjectId,
        deadline: dto.deadline !== undefined ? new Date(dto.deadline) : assignment.deadline,
        fileUrl,
        type: dto.type !== undefined ? dto.type : assignment.type,
        isPublished: dto.isPublished !== undefined ? dto.isPublished : assignment.isPublished,
      },
    });
  }

  async findAll(tenantId: string, query: QueryAssignmentDto, userContext?: { role: string; studentId?: string }) {
    const where: Prisma.AssignmentWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.batchId && { batchId: query.batchId }),
      ...(query.subjectId && { subjectId: query.subjectId }),
      ...(query.type && { type: query.type }),
      ...(query.isPublished !== undefined && { isPublished: query.isPublished }),
    };

    // Role-based filters
    if (userContext) {
      if (userContext.role === 'STUDENT' && userContext.studentId) {
        const studentId = userContext.studentId;
        // Restrict to student's batches
        const enrollments = await this.prisma.batchStudent.findMany({
          where: { studentId, status: 'ACTIVE' },
          select: { batchId: true },
        });
        const batchIds = enrollments.map(e => e.batchId);
        where.batchId = { in: batchIds };
        where.isPublished = true;
      } else if (userContext.role === 'PARENT' && userContext.studentId) {
        const studentId = userContext.studentId;
        const enrollments = await this.prisma.batchStudent.findMany({
          where: { studentId, status: 'ACTIVE' },
          select: { batchId: true },
        });
        const batchIds = enrollments.map(e => e.batchId);
        where.batchId = { in: batchIds };
        where.isPublished = true;
      }
    }

    const [assignments, total] = await Promise.all([
      this.prisma.assignment.findMany({
        where,
        include: {
          batch: { select: { name: true, code: true } },
          subject: { select: { name: true, code: true } },
          creator: { select: { email: true } },
          submissions: userContext?.studentId ? {
            where: { studentId: userContext.studentId },
          } : {
            select: { id: true, studentId: true, status: true },
          },
        },
        orderBy: { deadline: 'asc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.assignment.count({ where }),
    ]);

    // Format results to attach status directly
    const data = assignments.map(a => {
      const submission = userContext?.studentId ? a.submissions[0] : null;
      let status = 'Pending';
      if (submission) {
        status = submission.status;
      } else if (new Date() > a.deadline) {
        status = 'Late';
      }

      return {
        ...a,
        submissionStatus: status,
        submissionDetails: submission || null,
      };
    });

    return {
      data,
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  async findOne(tenantId: string, id: string, studentId?: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        batch: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        creator: { select: { email: true } },
        submissions: studentId ? {
          where: { studentId },
          include: { student: { select: { firstName: true, lastName: true, rollNumber: true } } },
        } : {
          include: { student: { select: { firstName: true, lastName: true, rollNumber: true } } },
        },
      },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');

    // Generate pre-signed URL for attachment if exists
    let attachmentPresignedUrl: string | null = null;
    if (assignment.fileUrl) {
      try {
        attachmentPresignedUrl = await this.storage.getPresignedUrl(assignment.fileUrl);
      } catch {}
    }

    return {
      ...assignment,
      attachmentPresignedUrl,
    };
  }

  // ──────────────────────────────────────────────────
  // SUBMISSIONS
  // ──────────────────────────────────────────────────

  async submit(
    tenantId: string,
    assignmentId: string,
    studentId: string,
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Submission file is required');

    const assignment = await this.prisma.assignment.findFirst({
      where: { id: assignmentId, tenantId, deletedAt: null },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    // Upload submission to MinIO
    const folder = `tenant-${tenantId}/assignments/submissions`;
    const { key } = await this.storage.uploadFile(file, folder);

    // Determine status (SUBMITTED or LATE)
    const submittedAt = new Date();
    const status = submittedAt > assignment.deadline ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED;

    const result = await this.prisma.$transaction(async (tx) => {
      // Upsert submission
      const sub = await tx.assignmentSubmission.upsert({
        where: { assignmentId_studentId: { assignmentId, studentId } },
        create: {
          tenantId,
          assignmentId,
          studentId,
          fileUrl: key,
          submittedAt,
          status,
        },
        update: {
          fileUrl: key,
          submittedAt,
          status,
          score: null, // Reset score on resubmission
          feedback: null,
          reviewedBy: null,
          reviewedAt: null,
        },
      });

      // Gamification Reward: 10 points for submission
      await tx.student.update({
        where: { id: studentId },
        data: { points: { increment: 10 } },
      });

      await tx.studentAchievement.create({
        data: {
          tenantId,
          studentId,
          achievementType: AchievementType.POINTS,
          points: 10,
          description: `Earned 10 points for submitting assignment: "${assignment.title}"`,
        },
      });

      return sub;
    });

    return result;
  }

  async grade(
    tenantId: string,
    assignmentId: string,
    studentId: string,
    teacherUserId: string,
    dto: GradeSubmissionDto,
  ) {
    const submission = await this.prisma.assignmentSubmission.findFirst({
      where: {
        assignmentId,
        studentId,
        tenantId,
      },
      include: {
        assignment: { select: { title: true } },
        student: { select: { userId: true } },
      },
    });

    if (!submission) throw new NotFoundException('Submission not found');

    const updated = await this.prisma.$transaction(async (tx) => {
      const sub = await tx.assignmentSubmission.update({
        where: { id: submission.id },
        data: {
          score: dto.score,
          feedback: dto.feedback || null,
          status: SubmissionStatus.REVIEWED,
          reviewedBy: teacherUserId,
          reviewedAt: new Date(),
        },
      });

      // Gamification Bonus: Perfect score extra points
      if (dto.score >= 95) {
        await tx.student.update({
          where: { id: studentId },
          data: { points: { increment: 20 } },
        });

        await tx.studentAchievement.create({
          data: {
            tenantId,
            studentId,
            achievementType: AchievementType.POINTS,
            points: 20,
            badgeName: 'Assignment Champion',
            badgeImageUrl: '/assets/badges/assignment_champion.png',
            description: `Earned 20 bonus points and Assignment Champion badge for high score on assignment: "${submission.assignment.title}"`,
          },
        });
      }

      return sub;
    });

    // Notify student of graded assignment
    if (submission.student.userId) {
      try {
        await this.notifications.create(tenantId, {
          title: 'Assignment Graded',
          body: `Your submission for "${submission.assignment.title}" has been reviewed. Score: ${dto.score}/100.`,
          type: NotificationType.ANNOUNCEMENT,
          targetIds: [submission.student.userId],
          data: { assignmentId },
        });
      } catch {}
    }

    return updated;
  }

  // ──────────────────────────────────────────────────
  // DELETE
  // ──────────────────────────────────────────────────

  async remove(tenantId: string, id: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');

    await this.prisma.assignment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  // ──────────────────────────────────────────────────
  // PRIVATE NOTIFICATION TRIGGER
  // ──────────────────────────────────────────────────

  private async triggerNewAssignmentNotification(tenantId: string, assignment: any) {
    const students = await this.prisma.student.findMany({
      where: { tenantId, batchEnrollments: { some: { batchId: assignment.batchId, status: 'ACTIVE' } } },
      select: { userId: true },
    });

    const targetIds = students.map(s => s.userId).filter(id => id);

    if (targetIds.length > 0) {
      await this.notifications.create(tenantId, {
        title: 'New Assignment Assigned',
        body: `A new assignment "${assignment.title}" has been assigned for subject ${assignment.subject.name}. Due on ${assignment.deadline.toISOString().split('T')[0]}.`,
        type: NotificationType.ANNOUNCEMENT,
        targetIds,
        data: { assignmentId: assignment.id },
      });
    }
  }
}
