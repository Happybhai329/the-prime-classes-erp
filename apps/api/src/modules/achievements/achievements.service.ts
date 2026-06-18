import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { QueryLeaderboardDto, LeaderboardMetric } from './dto';
import { AchievementType } from '@prime/shared-types';

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────
  // STUDENT GAMIFICATION PROFILE
  // ──────────────────────────────────────────────────

  async getStudentProfile(tenantId: string, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rollNumber: true,
        points: true,
        level: true,
        batchEnrollments: {
          where: { status: 'ACTIVE' },
          select: { batchId: true },
        },
      },
    });

    if (!student) throw new NotFoundException('Student not found');

    // Dynamic XP Level Calculation: Level Up requires: level * 150 points
    const xpForNextLevel = student.level * 150;
    const previousLevelXp = (student.level - 1) * 150;
    const progressXp = student.points - previousLevelXp;
    const progressPercent = Math.min(100, Math.max(0, Math.round((progressXp / 150) * 100)));

    // Fetch achievements (Badges and points logs)
    const achievements = await this.prisma.studentAchievement.findMany({
      where: { studentId },
      orderBy: { earnedAt: 'desc' },
    });

    // Resolve Ranks
    const batchId = student.batchEnrollments[0]?.batchId;
    let batchRank = 1;
    let instituteRank = 1;

    if (batchId) {
      // Calculate rank in batch
      const batchStudents = await this.prisma.student.findMany({
        where: {
          tenantId,
          batchEnrollments: { some: { batchId, status: 'ACTIVE' } },
        },
        select: { id: true, points: true },
        orderBy: { points: 'desc' },
      });
      batchRank = batchStudents.findIndex(s => s.id === studentId) + 1;
    }

    // Calculate rank in institute
    const instStudents = await this.prisma.student.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: { id: true, points: true },
      orderBy: { points: 'desc' },
    });
    instituteRank = instStudents.findIndex(s => s.id === studentId) + 1;

    return {
      studentName: `${student.firstName} ${student.lastName}`,
      rollNumber: student.rollNumber,
      points: student.points,
      level: student.level,
      xpForNextLevel,
      progressXp,
      progressPercent,
      batchRank,
      instituteRank,
      achievements,
    };
  }

  // ──────────────────────────────────────────────────
  // LEADERBOARDS (PART 9)
  // ──────────────────────────────────────────────────

  async getLeaderboard(tenantId: string, query: QueryLeaderboardDto) {
    const metric = query.metric || LeaderboardMetric.POINTS;
    const batchId = query.batchId;

    // Fetch base students filtered by batch
    const studentWhere: Prisma.StudentWhereInput = {
      tenantId,
      status: 'ACTIVE',
      ...(batchId && {
        batchEnrollments: { some: { batchId, status: 'ACTIVE' } },
      }),
    };

    const students = await this.prisma.student.findMany({
      where: studentWhere,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rollNumber: true,
        points: true,
        level: true,
        batchEnrollments: {
          select: { batch: { select: { name: true } } },
        },
      },
    });

    let rankedList: any[] = [];

    if (metric === LeaderboardMetric.POINTS) {
      // Sort by points desc
      rankedList = students
        .map(s => ({
          studentId: s.id,
          name: `${s.firstName} ${s.lastName}`,
          rollNumber: s.rollNumber,
          batchName: s.batchEnrollments[0]?.batch?.name || 'Unassigned',
          value: s.points,
          level: s.level,
        }))
        .sort((a, b) => b.value - a.value);

    } else if (metric === LeaderboardMetric.ATTENDANCE) {
      // Calculate attendance percentages
      rankedList = await Promise.all(
        students.map(async s => {
          const totalRecords = await this.prisma.attendanceRecord.count({
            where: { studentId: s.id, session: { tenantId } },
          });
          const presentRecords = await this.prisma.attendanceRecord.count({
            where: { studentId: s.id, status: 'PRESENT', session: { tenantId } },
          });

          const attendancePct = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

          return {
            studentId: s.id,
            name: `${s.firstName} ${s.lastName}`,
            rollNumber: s.rollNumber,
            batchName: s.batchEnrollments[0]?.batch?.name || 'Unassigned',
            value: attendancePct, // percentage
            level: s.level,
          };
        })
      );
      rankedList.sort((a, b) => b.value - a.value);

    } else if (metric === LeaderboardMetric.ACCURACY) {
      // Calculate average accuracy on mock tests
      rankedList = await Promise.all(
        students.map(async s => {
          const attempts = await this.prisma.testAttempt.findMany({
            where: { studentId: s.id, status: 'COMPLETED' },
            select: { accuracy: true },
          });
          
          let avgAcc = 0;
          if (attempts.length > 0) {
            const sum = attempts.reduce((acc, curr) => acc + Number(curr.accuracy || 0), 0);
            avgAcc = Math.round(sum / attempts.length);
          }

          return {
            studentId: s.id,
            name: `${s.firstName} ${s.lastName}`,
            rollNumber: s.rollNumber,
            batchName: s.batchEnrollments[0]?.batch?.name || 'Unassigned',
            value: avgAcc, // percentage accuracy
            level: s.level,
          };
        })
      );
      rankedList.sort((a, b) => b.value - a.value);

    } else if (metric === LeaderboardMetric.MARKS) {
      // Sort by average test marks percentage
      rankedList = await Promise.all(
        students.map(async s => {
          const marks = await this.prisma.testMarks.findMany({
            where: { studentId: s.id, isAbsent: false, test: { status: 'PUBLISHED' } },
            include: { test: { select: { totalMarks: true } } },
          });

          let avgPct = 0;
          if (marks.length > 0) {
            const sum = marks.reduce((acc, curr) => {
              const max = Number(curr.test.totalMarks);
              return acc + (max > 0 ? (Number(curr.marksObtained) / max) * 100 : 0);
            }, 0);
            avgPct = Math.round(sum / marks.length);
          }

          return {
            studentId: s.id,
            name: `${s.firstName} ${s.lastName}`,
            rollNumber: s.rollNumber,
            batchName: s.batchEnrollments[0]?.batch?.name || 'Unassigned',
            value: avgPct, // percentage marks
            level: s.level,
          };
        })
      );
      rankedList.sort((a, b) => b.value - a.value);
    }

    // Attach Rank to the final output list
    const items = rankedList.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    return {
      metric,
      generatedAt: new Date().toISOString(),
      items,
    };
  }

  // ──────────────────────────────────────────────────
  // GAMIFICATION SYSTEM (MILSESTONES & BADGES)
  // ──────────────────────────────────────────────────

  async grantBadge(tenantId: string, studentId: string, badgeName: string, description: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId, tenantId },
    });
    if (!student) throw new NotFoundException('Student not found');

    // Check if student already has this exact badge
    const existing = await this.prisma.studentAchievement.findFirst({
      where: { studentId, badgeName },
    });
    if (existing) return existing;

    // Grant badge & award 100 XP points
    return this.prisma.$transaction(async (tx) => {
      const achievement = await tx.studentAchievement.create({
        data: {
          tenantId,
          studentId,
          achievementType: AchievementType.BADGE,
          points: 100,
          badgeName,
          badgeImageUrl: `/assets/badges/${badgeName.toLowerCase().replace(/ /g, '_')}.png`,
          description,
        },
      });

      // Update student points & level up check
      const currentPoints = student.points + 100;
      // Formula: Level is points / 150
      const newLevel = Math.floor(currentPoints / 150) + 1;

      await tx.student.update({
        where: { id: studentId },
        data: {
          points: currentPoints,
          level: newLevel,
        },
      });

      return achievement;
    });
  }

  /**
   * Scans a student's logs to automatically reward qualifying badges.
   */
  async autoCheckMilestones(tenantId: string, studentId: string) {
    // 1. Perfect Attendance Check
    const totalSessions = await this.prisma.attendanceRecord.count({
      where: { studentId, session: { tenantId } },
    });
    const presentSessions = await this.prisma.attendanceRecord.count({
      where: { studentId, status: 'PRESENT', session: { tenantId } },
    });

    if (totalSessions >= 10 && presentSessions === totalSessions) {
      await this.grantBadge(
        tenantId,
        studentId,
        'Perfect Attendance',
        'Maintained a flawless 100% attendance record over 10+ academic lectures.'
      );
    }

    // 2. Assignment Champion (Graded 95%+)
    const highestSubmission = await this.prisma.assignmentSubmission.findFirst({
      where: { studentId, tenantId, score: { gte: 95 } },
    });
    if (highestSubmission) {
      await this.grantBadge(
        tenantId,
        studentId,
        'Assignment Champion',
        'Achieved a score of 95% or higher on homework sheets.'
      );
    }

    // 3. Top Performer (Ranked #1 in any batch exam)
    const topExam = await this.prisma.testRanking.findFirst({
      where: { studentId, batchRank: 1 },
    });
    if (topExam) {
      await this.grantBadge(
        tenantId,
        studentId,
        'Top Performer',
        'Ranked #1 in a scheduled test paper across the batch.'
      );
    }

    // 4. Consistent Learner (Submitted 5 assignments on time)
    const onTimeSubmissions = await this.prisma.assignmentSubmission.count({
      where: { studentId, tenantId, status: 'SUBMITTED' }, // 'SUBMITTED' is on-time, 'LATE' is late
    });
    if (onTimeSubmissions >= 5) {
      await this.grantBadge(
        tenantId,
        studentId,
        'Consistent Learner',
        'Submitted 5 assignment sheets on time without delays.'
      );
    }

    return { success: true };
  }
}
