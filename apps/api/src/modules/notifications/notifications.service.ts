import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateNotificationDto, QueryNotificationDto, RegisterDeviceDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';
import { NotificationType, NotificationDeliveryStatus, UserRole } from '@prime/shared-types';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────
  // CREATE NOTIFICATION
  // ──────────────────────────────────────────────────

  async create(tenantId: string, dto: CreateNotificationDto) {
    const { title, body, type, targetRoles, targetIds, data } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Create main notification entry
      const notification = await tx.notification.create({
        data: {
          tenantId,
          title,
          body,
          type,
          targetRoles: targetRoles || [],
          targetIds: targetIds || [],
          data: (data || {}) as Prisma.InputJsonValue,
        },
      });

      // Resolve actual user IDs to target
      let userIdsToTarget: string[] = [];

      if (targetIds && targetIds.length > 0) {
        userIdsToTarget = targetIds;
      } else if (targetRoles && targetRoles.length > 0) {
        // Fetch all users with the specified roles in this tenant
        const users = await tx.user.findMany({
          where: {
            tenantId,
            role: { in: targetRoles },
            isActive: true,
          },
          select: { id: true },
        });
        userIdsToTarget = users.map(u => u.id);
      }

      // Create notification logs (in-app deliveries) for each user
      if (userIdsToTarget.length > 0) {
        const logsData = userIdsToTarget.map(userId => ({
          notificationId: notification.id,
          userId,
          channel: 'IN_APP',
          status: NotificationDeliveryStatus.SENT,
        }));

        await tx.notificationLog.createMany({ data: logsData });
      }

      this.logger.log(`Created notification ${notification.id} targeting ${userIdsToTarget.length} users`);

      // TODO: Future extension - queue email/SMS delivery tasks here

      return notification;
    });
  }

  // ──────────────────────────────────────────────────
  // GET USER NOTIFICATIONS
  // ──────────────────────────────────────────────────

  async getUserNotifications(tenantId: string, userId: string, query: QueryNotificationDto) {
    const where: Prisma.NotificationLogWhereInput = {
      userId,
      notification: {
        tenantId,
        ...(query.type && { type: query.type }),
      },
    };

    const [logs, total] = await Promise.all([
      this.prisma.notificationLog.findMany({
        where,
        include: {
          notification: true,
        },
        orderBy: {
          notification: { sentAt: 'desc' },
        },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.notificationLog.count({ where }),
    ]);

    const data = logs.map(log => ({
      id: log.notificationId, // Return notification ID as primary identifier
      logId: log.id,
      title: (log as any).notification.title,
      body: (log as any).notification.body,
      type: (log as any).notification.type,
      data: (log as any).notification.data,
      isRead: log.readAt !== null,
      readAt: log.readAt,
      createdAt: (log as any).notification.sentAt,
    }));

    return {
      data,
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  // ──────────────────────────────────────────────────
  // UNREAD COUNT
  // ──────────────────────────────────────────────────

  async getUnreadCount(tenantId: string, userId: string) {
    const count = await this.prisma.notificationLog.count({
      where: {
        userId,
        readAt: null,
        notification: { tenantId },
      },
    });

    return { unreadCount: count };
  }

  // ──────────────────────────────────────────────────
  // MARK READ
  // ──────────────────────────────────────────────────

  async markRead(tenantId: string, userId: string, notificationId: string) {
    await this.prisma.notificationLog.updateMany({
      where: {
        userId,
        notificationId,
        notification: { tenantId },
      },
      data: { readAt: new Date() },
    });

    return { success: true };
  }

  async markAllRead(tenantId: string, userId: string) {
    await this.prisma.notificationLog.updateMany({
      where: {
        userId,
        readAt: null,
        notification: { tenantId },
      },
      data: { readAt: new Date() },
    });

    return { success: true };
  }

  // ──────────────────────────────────────────────────
  // AUTO-TRIGGERS
  // ──────────────────────────────────────────────────

  async triggerAttendanceAbsent(tenantId: string, batchId: string, date: string, studentIds: string[]) {
    if (!studentIds.length) return;

    // Find parents of these students
    const parents = await this.prisma.parent.findMany({
      where: {
        tenantId,
        studentMappings: { some: { studentId: { in: studentIds } } },
      },
      select: { userId: true },
    });

    const parentUserIds = Array.from(new Set(parents.map(p => p.userId).filter(id => id)));

    if (parentUserIds.length > 0) {
      await this.create(tenantId, {
        title: 'Attendance Alert',
        body: `Your child was marked absent on ${date}.`,
        type: NotificationType.LOW_ATTENDANCE_ALERT,
        targetIds: parentUserIds,
      });
    }
  }

  async triggerTestScheduled(tenantId: string, batchId: string, testName: string, testDate: string) {
    // Notify parents and students of the batch
    const students = await this.prisma.student.findMany({
      where: { tenantId, batchEnrollments: { some: { batchId, status: 'ACTIVE' } } },
      select: { userId: true, parentMappings: { select: { parent: { select: { userId: true } } } } },
    });

    const targetIds = new Set<string>();
    students.forEach(s => {
      if (s.userId) targetIds.add(s.userId);
      s.parentMappings.forEach((pm: any) => { if (pm.parent?.userId) targetIds.add(pm.parent.userId); });
    });

    if (targetIds.size > 0) {
      await this.create(tenantId, {
        title: 'New Test Scheduled',
        body: `A new test "${testName}" has been scheduled for ${testDate}.`,
        type: NotificationType.EXAM_ALERT,
        targetIds: Array.from(targetIds),
      });
    }
  }

  async triggerFeeDue(tenantId: string, invoiceId: string, studentId: string, amount: number, dueDate: Date) {
    const parent = await this.prisma.parent.findFirst({
      where: { tenantId, studentMappings: { some: { studentId } } },
      select: { userId: true },
    });

    if (parent?.userId) {
      await this.create(tenantId, {
        title: 'Fee Payment Due',
        body: `A fee payment of ₹${amount} is due on ${dueDate.toISOString().split('T')[0]}.`,
        type: NotificationType.FEE_DUE,
        targetIds: [parent.userId],
        data: { invoiceId },
      });
    }
  }

  async triggerNoticePublished(tenantId: string, noticeId: string, title: string, targetRoles?: string[], targetBatchIds?: string[]) {
    // If specific roles
    if (targetRoles && targetRoles.length > 0) {
      await this.create(tenantId, {
        title: 'New Notice',
        body: title,
        type: NotificationType.ANNOUNCEMENT,
        targetRoles: targetRoles as UserRole[],
        data: { noticeId },
      });
    } else if (targetBatchIds && targetBatchIds.length > 0) {
      // Find all students and parents of these batches
      const students = await this.prisma.student.findMany({
        where: { tenantId, batchEnrollments: { some: { batchId: { in: targetBatchIds } } } },
        select: { userId: true, parentMappings: { select: { parent: { select: { userId: true } } } } }
      });
      
      const targetIds = new Set<string>();
      students.forEach(s => {
        if (s.userId) targetIds.add(s.userId);
        s.parentMappings.forEach(pm => {
          if (pm.parent?.userId) targetIds.add(pm.parent.userId);
        });
      });

      if (targetIds.size > 0) {
        await this.create(tenantId, {
          title: 'New Notice',
          body: title,
          type: NotificationType.ANNOUNCEMENT,
          targetIds: Array.from(targetIds),
          data: { noticeId },
        });
      }
    } else {
      // All
      await this.create(tenantId, {
        title: 'New Notice',
        body: title,
        type: NotificationType.ANNOUNCEMENT,
        targetRoles: [UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT, UserRole.PARENT],
        data: { noticeId },
      });
    }
  }

  async triggerTicketUpdate(tenantId: string, ticketId: string, userIdToNotify: string, status: string) {
    await this.create(tenantId, {
      title: 'Support Ticket Update',
      body: `Your ticket has been updated to: ${status}`,
      type: NotificationType.ANNOUNCEMENT,
      targetIds: [userIdToNotify],
      data: { ticketId },
    });
  }

  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken: dto.fcmToken },
    });
    this.logger.log(`Registered push token for user ${userId}`);
    return { success: true };
  }
}
