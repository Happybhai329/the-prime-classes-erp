import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { TargetExam, PerformanceCategory, RankTrendDirection } from '@prisma/client';

export interface StudentFeatures {
  studentId: string;
  attendanceRate: number;
  averageTestScore: number;
  assignmentCompletionRate: number;
  rankSlope: number; // trend of ranks (negative is improving, positive is declining)
  studyActivityCount: number;
}

export interface ExplainerPoint {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to perform linear regression slope calculation
   */
  private calculateSlope(values: number[]): number {
    if (values.length <= 1) return 0;
    const n = values.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }

    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) return 0;
    return (n * sumXY - sumX * sumY) / denominator;
  }

  /**
   * Extract features for a single student
   */
  async extractFeatures(tenantId: string, studentId: string): Promise<StudentFeatures> {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId, deletedAt: null },
      include: {
        batchEnrollments: true,
      },
    });

    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    const batchIds = student.batchEnrollments.map((e) => e.batchId);

    // 1. Attendance Rate
    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: { studentId },
      select: { status: true },
    });
    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE' || r.status === 'LEAVE',
    ).length;
    const attendanceRate = totalAttendance > 0 ? presentCount / totalAttendance : 0.85; // Default fallback to 85%

    // 2. Average Test Scores
    const testMarks = await this.prisma.testMarks.findMany({
      where: { studentId, isAbsent: false },
      include: { test: true },
    });
    let totalScoreSum = 0;
    let totalScoreCount = 0;
    const scoresList: number[] = [];

    for (const mark of testMarks) {
      const totalMarks = Number(mark.test.totalMarks);
      const obtained = Number(mark.marksObtained);
      if (totalMarks > 0) {
        const pct = (obtained / totalMarks) * 100;
        scoresList.push(pct);
        totalScoreSum += pct;
        totalScoreCount++;
      }
    }
    const averageTestScore = totalScoreCount > 0 ? totalScoreSum / totalScoreCount : 65; // Default fallback to 65%

    // 3. Assignment Completion Rate
    const submissions = await this.prisma.assignmentSubmission.findMany({
      where: { studentId },
      select: { status: true },
    });
    // Find all assignments for this student's batches
    const totalAssignments = await this.prisma.assignment.count({
      where: { batchId: { in: batchIds }, deletedAt: null },
    });
    const completedAssignments = submissions.filter(
      (s) => s.status === 'SUBMITTED' || s.status === 'REVIEWED',
    ).length;
    const assignmentCompletionRate =
      totalAssignments > 0 ? completedAssignments / totalAssignments : 1.0; // Fallback to 100%

    // 4. Rank Trend
    const rankings = await this.prisma.testRanking.findMany({
      where: { studentId },
      include: { test: true },
      orderBy: { test: { testDate: 'asc' } },
      take: 6,
    });
    const batchRanks = rankings.map((r) => r.batchRank);
    const rankSlope = this.calculateSlope(batchRanks);

    // 5. Study Activity
    const materialViews = await this.prisma.materialAccessLog.count({
      where: { userId: student.userId, tenantId },
    });
    const videoViews = await this.prisma.testAttempt.count({
      where: { studentId, tenantId },
    });
    const studyActivityCount = materialViews + videoViews;

    return {
      studentId,
      attendanceRate,
      averageTestScore,
      assignmentCompletionRate,
      rankSlope,
      studyActivityCount,
    };
  }

  /**
   * Run the rule-based Scoring Engine for a student
   */
  async scoreStudent(tenantId: string, studentId: string) {
    const features = await this.extractFeatures(tenantId, studentId);
    
    // Calculate individual category score out of 100
    // Attendance Score (max 100)
    let attendanceScore = features.attendanceRate * 100;
    
    // Test Score (max 100)
    let testScore = features.averageTestScore;

    // Assignment Score (max 100)
    let assignmentScore = features.assignmentCompletionRate * 100;

    // Study Activity Score (log scaled, max 100, assuming 20 activities is 100%)
    let studyScore = Math.min(100, (features.studyActivityCount / 20) * 100);

    // Rank Trend Score
    // Negative slope = rank is getting better (1st rank instead of 5th).
    // Positive slope = rank is getting worse.
    let rankScore = 70; // baseline
    if (features.rankSlope < 0) {
      rankScore = Math.min(100, 70 + Math.abs(features.rankSlope) * 15);
    } else if (features.rankSlope > 0) {
      rankScore = Math.max(0, 70 - features.rankSlope * 15);
    }

    // Weighted Total Score
    const successProbabilityVal = 
      attendanceScore * 0.20 +
      testScore * 0.45 +
      assignmentScore * 0.15 +
      rankScore * 0.10 +
      studyScore * 0.10;

    const successProbability = Math.min(99, Math.max(1, Math.round(successProbabilityVal)));

    // Categorization
    let category: PerformanceCategory = PerformanceCategory.MODERATE;
    if (successProbability >= 85) {
      category = PerformanceCategory.EXCELLENT;
    } else if (successProbability >= 70) {
      category = PerformanceCategory.STRONG;
    } else if (successProbability >= 50) {
      category = PerformanceCategory.MODERATE;
    } else {
      category = PerformanceCategory.AT_RISK;
    }

    // Rank Trend Direction
    let rankTrend: RankTrendDirection = RankTrendDirection.STABLE;
    if (features.rankSlope < -0.2) {
      rankTrend = RankTrendDirection.UPWARD;
    } else if (features.rankSlope > 0.2) {
      rankTrend = RankTrendDirection.DOWNWARD;
    }

    // Generate Exam Specific Success Rates
    // Target Exams: Sainik School, RMS, RIMC, Military School Scholarship
    const predictedExams: Record<string, number> = {};
    const exams: TargetExam[] = [TargetExam.SAINIK, TargetExam.RMS, TargetExam.RIMC, TargetExam.SCHOLARSHIP];
    
    for (const exam of exams) {
      let multiplier = 1.0;
      // Tailor performance based on mock exam details or weights
      if (exam === TargetExam.RIMC) {
        // RIMC is extremely hard, passing percentage is typically lower
        multiplier = 0.85; 
      } else if (exam === TargetExam.SCHOLARSHIP) {
        multiplier = 0.95;
      }
      predictedExams[exam] = Math.min(99, Math.max(1, Math.round(successProbability * multiplier)));
    }

    // Generate Explanations
    const explanations: ExplainerPoint[] = [];
    if (features.attendanceRate < 0.75) {
      explanations.push({
        factor: 'Attendance',
        impact: 'negative',
        description: `Low attendance rate of ${(features.attendanceRate * 100).toFixed(0)}% (minimum target is 75%).`,
      });
    } else if (features.attendanceRate >= 0.90) {
      explanations.push({
        factor: 'Attendance',
        impact: 'positive',
        description: `Excellent attendance rate of ${(features.attendanceRate * 100).toFixed(0)}%.`,
      });
    }

    if (features.averageTestScore < 50) {
      explanations.push({
        factor: 'Test Performance',
        impact: 'negative',
        description: `Test score average is low at ${features.averageTestScore.toFixed(0)}%.`,
      });
    } else if (features.averageTestScore >= 80) {
      explanations.push({
        factor: 'Test Performance',
        impact: 'positive',
        description: `Superb test average of ${features.averageTestScore.toFixed(0)}%.`,
      });
    }

    if (features.assignmentCompletionRate < 0.60) {
      explanations.push({
        factor: 'Assignments',
        impact: 'negative',
        description: `Completed only ${(features.assignmentCompletionRate * 100).toFixed(0)}% of assignments.`,
      });
    }

    if (features.rankSlope < -0.5) {
      explanations.push({
        factor: 'Rank Trend',
        impact: 'positive',
        description: `Consistent improvement in batch ranks over recent tests.`,
      });
    } else if (features.rankSlope > 0.5) {
      explanations.push({
        factor: 'Rank Trend',
        impact: 'negative',
        description: `Batches ranks are sliding downwards. Additional mock revision needed.`,
      });
    }

    if (features.studyActivityCount > 15) {
      explanations.push({
        factor: 'LMS Activity',
        impact: 'positive',
        description: `Highly active on the LMS with ${features.studyActivityCount} resource interactions.`,
      });
    }

    if (explanations.length === 0) {
      explanations.push({
        factor: 'General Activity',
        impact: 'neutral',
        description: `Student is showing consistent, average performance across indicators.`,
      });
    }

    return {
      successProbability,
      category,
      rankTrend,
      predictedExams,
      explanations,
      features,
    };
  }

  /**
   * Syncs and stores prediction snapshots for a student
   */
  async syncStudentAnalytics(tenantId: string, studentId: string) {
    const scored = await this.scoreStudent(tenantId, studentId);
    
    // Store in StudentAnalyticsSnapshot
    const snapshot = await this.prisma.studentAnalyticsSnapshot.upsert({
      where: { studentId },
      update: {
        successProbability: scored.successProbability,
        category: scored.category,
        rankTrend: scored.rankTrend,
        predictedExams: scored.predictedExams,
        recommendations: scored.explanations as any, // reuse explanations as baseline logs
      },
      create: {
        tenantId,
        studentId,
        successProbability: scored.successProbability,
        category: scored.category,
        rankTrend: scored.rankTrend,
        predictedExams: scored.predictedExams,
        recommendations: scored.explanations as any,
      },
    });

    // Warehousing Snapshots: Save monthly historical record
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    await this.prisma.historicalPerformance.upsert({
      where: {
        studentId_month_year: { studentId, month, year },
      },
      update: {
        averageTestScore: scored.features.averageTestScore,
        attendanceRate: scored.features.attendanceRate * 100,
        assignmentCompletionRate: scored.features.assignmentCompletionRate * 100,
        studyActivityScore: scored.features.studyActivityCount,
      },
      create: {
        tenantId,
        studentId,
        month,
        year,
        averageTestScore: scored.features.averageTestScore,
        attendanceRate: scored.features.attendanceRate * 100,
        assignmentCompletionRate: scored.features.assignmentCompletionRate * 100,
        studyActivityScore: scored.features.studyActivityCount,
      },
    });

    // Attendance Snapshot
    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: { studentId },
      include: { session: true },
    });
    
    const currentMonthRecords = attendanceRecords.filter((r) => {
      const d = new Date(r.session.sessionDate);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const presentCount = currentMonthRecords.filter((r) => r.status === 'PRESENT').length;
    const absentCount = currentMonthRecords.filter((r) => r.status === 'ABSENT').length;
    const lateCount = currentMonthRecords.filter((r) => r.status === 'LATE').length;
    const leaveCount = currentMonthRecords.filter((r) => r.status === 'LEAVE').length;

    await this.prisma.attendanceSnapshot.upsert({
      where: {
        studentId_month_year: { studentId, month, year },
      },
      update: {
        presentCount,
        absentCount,
        lateCount,
        leaveCount,
        totalSessions: currentMonthRecords.length,
      },
      create: {
        tenantId,
        studentId,
        month,
        year,
        presentCount,
        absentCount,
        lateCount,
        leaveCount,
        totalSessions: currentMonthRecords.length,
      },
    });

    // Save rankings history
    const latestRanks = await this.prisma.testRanking.findMany({
      where: { studentId },
      include: { test: true },
    });

    for (const rank of latestRanks) {
      await this.prisma.rankingHistory.upsert({
        where: {
          studentId_testId: { studentId, testId: rank.testId },
        },
        update: {
          batchRank: rank.batchRank,
          instituteRank: rank.overallRank,
          percentile: rank.percentile,
          testDate: rank.test.testDate,
        },
        create: {
          tenantId,
          studentId,
          testId: rank.testId,
          batchRank: rank.batchRank,
          instituteRank: rank.overallRank,
          percentile: rank.percentile,
          testDate: rank.test.testDate,
        },
      });
    }

    return snapshot;
  }

  /**
   * Run sync for all active students in a tenant
   */
  async syncAllStudents(tenantId: string) {
    const students = await this.prisma.student.findMany({
      where: { tenantId, status: 'ACTIVE', deletedAt: null },
      select: { id: true },
    });

    this.logger.log(`Triggering analytics sync for ${students.length} students in tenant ${tenantId}`);
    for (const stud of students) {
      try {
        await this.syncStudentAnalytics(tenantId, stud.id);
      } catch (err: any) {
        this.logger.error(`Failed to sync student ${stud.id}: ${err.message}`);
      }
    }

    // Also sync Revenue History
    await this.syncRevenueHistory(tenantId);
  }

  /**
   * Aggregate and sync revenue history + forecasts
   */
  async syncRevenueHistory(tenantId: string) {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Sum all payments collected for each month of the past year
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();

      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59);

      const payments = await this.prisma.feePayment.aggregate({
        where: {
          tenantId,
          paymentDate: { gte: startDate, lte: endDate },
          deletedAt: null,
        },
        _sum: { amountPaid: true },
      });

      const actualRevenue = Number(payments._sum.amountPaid || 0);

      // Forecast amount using statistical trend (linear projection)
      // Let's do it after we have all items
      await this.prisma.revenueHistory.upsert({
        where: {
          tenantId_month_year: { tenantId, month: m, year: y },
        },
        update: {
          amount: actualRevenue,
        },
        create: {
          tenantId,
          month: m,
          year: y,
          amount: actualRevenue,
        },
      });
    }

    // Now calculate forecasts for the next 3 months
    const historical = await this.prisma.revenueHistory.findMany({
      where: { tenantId },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
      take: 12,
    });

    const amounts = historical.map((h) => Number(h.amount));
    const slope = this.calculateSlope(amounts);
    const intercept = amounts.length > 0 ? amounts[amounts.length - 1] - slope * (amounts.length - 1) : 0;

    for (let j = 1; j <= 3; j++) {
      const forecastDate = new Date(today.getFullYear(), today.getMonth() + j, 1);
      const fm = forecastDate.getMonth() + 1;
      const fy = forecastDate.getFullYear();

      // Forecast = Slope * X + Intercept
      const x = amounts.length - 1 + j;
      const forecastAmount = Math.max(0, slope * x + intercept);

      await this.prisma.revenueHistory.upsert({
        where: {
          tenantId_month_year: { tenantId, month: fm, year: fy },
        },
        update: {
          forecastAmount,
        },
        create: {
          tenantId,
          month: fm,
          year: fy,
          amount: 0,
          forecastAmount,
        },
      });
    }
  }

  /**
   * Question performance analytics
   */
  async getQuestionAnalytics(tenantId: string) {
    const testResponses = await this.prisma.testResponse.findMany({
      where: {
        attempt: { tenantId },
      },
      select: {
        questionId: true,
        isCorrect: true,
        selectedAnswer: true,
      },
    });

    // Group by questionId
    const groups: Record<string, { total: number; correct: number; wrong: number; skip: number }> = {};
    for (const resp of testResponses) {
      if (!groups[resp.questionId]) {
        groups[resp.questionId] = { total: 0, correct: 0, wrong: 0, skip: 0 };
      }
      const g = groups[resp.questionId];
      g.total++;
      if (resp.selectedAnswer === null || resp.selectedAnswer === '') {
        g.skip++;
      } else if (resp.isCorrect) {
        g.correct++;
      } else {
        g.wrong++;
      }
    }

    const questionDetails = await this.prisma.question.findMany({
      where: { tenantId, deletedAt: null },
      select: { id: true, questionText: true, topic: true, difficulty: true, subject: { select: { name: true } } },
    });

    const result = questionDetails.map((q) => {
      const stats = groups[q.id] || { total: 0, correct: 0, wrong: 0, skip: 0 };
      const correctPct = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
      const wrongPct = stats.total > 0 ? (stats.wrong / stats.total) * 100 : 0;
      const skipPct = stats.total > 0 ? (stats.skip / stats.total) * 100 : 0;
      const difficultyScore = stats.total > 0 ? 1 - stats.correct / stats.total : 0.5;

      let classification = 'GOOD';
      if (stats.total >= 5) {
        if (correctPct > 85) classification = 'TOO_EASY';
        else if (correctPct < 25) classification = 'TOO_HARD';
        else if (wrongPct > 60) classification = 'POORLY_PERFORMING';
      }

      return {
        id: q.id,
        questionText: q.questionText,
        subjectName: q.subject.name,
        topic: q.topic,
        originalDifficulty: q.difficulty,
        totalAttempts: stats.total,
        correctPct: Math.round(correctPct),
        wrongPct: Math.round(wrongPct),
        skipPct: Math.round(skipPct),
        difficultyScore: Math.round(difficultyScore * 100) / 100,
        classification,
      };
    });

    return result;
  }

  /**
   * Enrollment & Batch Capacity projections
   */
  async getInstituteIntelligence(tenantId: string) {
    // 1. Enrollment forecasts
    const growthHistory = await this.prisma.student.findMany({
      where: { tenantId, deletedAt: null },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group active student entries by month for the last 12 months
    const monthlyEnrollmentsCount: number[] = [];
    const monthsLabels: string[] = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59);

      const count = growthHistory.filter((st) => st.createdAt <= endOfMonth).length;
      monthlyEnrollmentsCount.push(count);
      monthsLabels.push(d.toLocaleString('en-US', { month: 'short', year: 'numeric' }));
    }

    const enrSlope = this.calculateSlope(monthlyEnrollmentsCount);
    const enrIntercept = monthlyEnrollmentsCount[monthlyEnrollmentsCount.length - 1] - enrSlope * (monthlyEnrollmentsCount.length - 1);

    const enrollmentForecast: { month: string; count: number; isForecast: boolean }[] = [];
    // Populate past counts
    for (let i = 0; i < 12; i++) {
      enrollmentForecast.push({
        month: monthsLabels[i],
        count: monthlyEnrollmentsCount[i],
        isForecast: false,
      });
    }

    // Populate 3 months projection
    for (let j = 1; j <= 3; j++) {
      const fd = new Date(today.getFullYear(), today.getMonth() + j, 1);
      const label = fd.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const x = monthlyEnrollmentsCount.length - 1 + j;
      const count = Math.max(0, Math.round(enrSlope * x + enrIntercept));
      enrollmentForecast.push({
        month: label,
        count,
        isForecast: true,
      });
    }

    // 2. Revenue trends
    const revenueList = await this.prisma.revenueHistory.findMany({
      where: { tenantId },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });

    const revenueTrends = revenueList.map((r) => {
      const d = new Date(r.year, r.month - 1, 1);
      return {
        month: d.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        actual: Number(r.amount),
        forecast: r.forecastAmount ? Number(r.forecastAmount) : null,
      };
    });

    // 3. Batch Capacity warnings
    const batches = await this.prisma.batch.findMany({
      where: { tenantId, isActive: true },
      include: {
        students: { where: { status: 'ACTIVE' } },
      },
    });

    const capacityAnalysis = batches.map((b) => {
      const currentStrength = b.students.length;
      const maxStrength = b.maxStrength || 50;
      const utilizationRate = maxStrength > 0 ? (currentStrength / maxStrength) * 100 : 0;
      const status = utilizationRate >= 90 ? 'CRITICAL' : utilizationRate >= 75 ? 'WARNING' : 'OPTIMAL';

      return {
        batchId: b.id,
        batchName: b.name,
        batchCode: b.code,
        currentStrength,
        maxStrength,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        status,
      };
    });

    return {
      enrollmentForecast,
      revenueTrends,
      capacityAnalysis,
    };
  }

  /**
   * At-risk student alert extraction
   */
  async getAtRiskStudents(tenantId: string, batchId?: string) {
    const students = await this.prisma.student.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        deletedAt: null,
        ...(batchId ? { batchEnrollments: { some: { batchId } } } : {}),
      },
      include: {
        batchEnrollments: { include: { batch: true } },
        analyticsSnapshot: true,
      },
    });

    const flagged: any[] = [];

    for (const stud of students) {
      const snapshot = stud.analyticsSnapshot;
      if (!snapshot) continue;

      const category = snapshot.category;
      
      // We flag if category is AT_RISK or MODERATE with negative indicators
      if (category === PerformanceCategory.AT_RISK || category === PerformanceCategory.MODERATE) {
        const explanations = (snapshot.recommendations as any) || [];
        const negativeTriggers = explanations.filter((exp: any) => exp.impact === 'negative');

        if (negativeTriggers.length > 0) {
          flagged.push({
            studentId: stud.id,
            studentName: `${stud.firstName} ${stud.lastName}`,
            rollNumber: stud.rollNumber,
            batchName: stud.batchEnrollments[0]?.batch?.name || 'N/A',
            successProbability: Number(snapshot.successProbability),
            category,
            triggers: negativeTriggers.map((t: any) => t.description),
            updatedAt: snapshot.updatedAt,
          });
        }
      }
    }

    return flagged;
  }
}
