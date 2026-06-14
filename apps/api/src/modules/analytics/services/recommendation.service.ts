import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface TopicPerformance {
  subjectId: string;
  subjectName: string;
  topic: string;
  correctCount: number;
  totalQuestions: number;
  accuracy: number; // 0-100
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get topic-level accuracy details for a student
   */
  async getTopicPerformance(tenantId: string, studentId: string): Promise<TopicPerformance[]> {
    // 1. Analyze online test attempts and responses
    const responses = await this.prisma.testResponse.findMany({
      where: {
        attempt: {
          studentId,
          tenantId,
          status: 'COMPLETED',
        },
      },
      include: {
        attempt: {
          include: {
            onlineTest: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    const questionIds = responses.map((r) => r.questionId);
    
    // Fetch details of questions to map to topic
    const questions = await this.prisma.question.findMany({
      where: {
        id: { in: questionIds },
      },
      include: {
        subject: true,
      },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Group responses by subject and topic
    const groups: Record<string, { subjectId: string; subjectName: string; topic: string; correct: number; total: number }> = {};

    for (const resp of responses) {
      const q = questionMap.get(resp.questionId);
      if (!q) continue;

      const subjectId = q.subjectId;
      const subjectName = q.subject.name;
      const topic = q.topic;
      const key = `${subjectId}::${topic}`;

      if (!groups[key]) {
        groups[key] = {
          subjectId,
          subjectName,
          topic,
          correct: 0,
          total: 0,
        };
      }

      groups[key].total++;
      if (resp.isCorrect) {
        groups[key].correct++;
      }
    }

    // Convert to array
    const results = Object.values(groups).map((g) => ({
      subjectId: g.subjectId,
      subjectName: g.subjectName,
      topic: g.topic,
      correctCount: g.correct,
      totalQuestions: g.total,
      accuracy: Math.round((g.correct / g.total) * 100),
    }));

    return results;
  }

  /**
   * Get personalized recommendations (revision study materials, mock tests, and assignments)
   */
  async getPersonalizedRecommendations(tenantId: string, studentId: string) {
    const performances = await this.getTopicPerformance(tenantId, studentId);
    
    const weakTopics = performances.filter((p) => p.accuracy < 60);
    const strongTopics = performances.filter((p) => p.accuracy >= 80);

    const studyMaterials: any[] = [];
    const recommendedTests: any[] = [];
    const revisionAssignments: any[] = [];

    // Extract subjects and topics for search
    const weakSubjectIds = Array.from(new Set(weakTopics.map((wt) => wt.subjectId)));
    const weakTopicsNames = weakTopics.map((wt) => wt.topic);

    if (weakTopicsNames.length > 0) {
      // Find relevant study materials uploaded for these subjects/topics
      const materials = await this.prisma.material.findMany({
        where: {
          tenantId,
          subjectId: { in: weakSubjectIds },
          topic: { in: weakTopicsNames },
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          fileUrl: true,
          topic: true,
          subject: { select: { name: true } },
        },
        take: 5,
      });

      studyMaterials.push(
        ...materials.map((m) => ({
          id: m.id,
          title: m.title,
          fileUrl: m.fileUrl,
          topic: m.topic,
          subjectName: m.subject?.name || 'General',
          type: 'STUDY_MATERIAL',
        })),
      );

      // Find Mock tests containing these topics
      const tests = await this.prisma.onlineTest.findMany({
        where: {
          tenantId,
          subjectId: { in: weakSubjectIds },
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          durationMinutes: true,
          totalMarks: true,
          subject: { select: { name: true } },
        },
        take: 3,
      });

      recommendedTests.push(
        ...tests.map((t) => ({
          id: t.id,
          title: t.title,
          durationMinutes: t.durationMinutes,
          totalMarks: Number(t.totalMarks),
          subjectName: t.subject?.name || 'General',
          type: 'MOCK_TEST',
        })),
      );

      // Find pending or past assignments in those subjects
      const assignments = await this.prisma.assignment.findMany({
        where: {
          tenantId,
          subjectId: { in: weakSubjectIds },
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          deadline: true,
          subject: { select: { name: true } },
        },
        take: 3,
      });

      revisionAssignments.push(
        ...assignments.map((a) => ({
          id: a.id,
          title: a.title,
          deadline: a.deadline,
          subjectName: a.subject.name,
          type: 'REVISION_ASSIGNMENT',
        })),
      );
    }

    // Default suggestions if no weak topics detected yet
    if (studyMaterials.length === 0) {
      const generalMaterials = await this.prisma.material.findMany({
        where: { tenantId, isPublished: true },
        include: { subject: true },
        take: 3,
      });
      studyMaterials.push(
        ...generalMaterials.map((m) => ({
          id: m.id,
          title: m.title,
          fileUrl: m.fileUrl,
          topic: m.topic || 'General Revision',
          subjectName: m.subject?.name || 'General',
          type: 'STUDY_MATERIAL',
        })),
      );
    }

    if (recommendedTests.length === 0) {
      const generalTests = await this.prisma.onlineTest.findMany({
        where: { tenantId, isPublished: true },
        include: { subject: true },
        take: 2,
      });
      recommendedTests.push(
        ...generalTests.map((t) => ({
          id: t.id,
          title: t.title,
          durationMinutes: t.durationMinutes,
          totalMarks: Number(t.totalMarks),
          subjectName: t.subject?.name || 'General',
          type: 'MOCK_TEST',
        })),
      );
    }

    return {
      weakTopics: weakTopics.map((wt) => ({
        subjectId: wt.subjectId,
        subjectName: wt.subjectName,
        topic: wt.topic,
        accuracy: wt.accuracy,
      })),
      strongTopics: strongTopics.map((st) => ({
        subjectId: st.subjectId,
        subjectName: st.subjectName,
        topic: st.topic,
        accuracy: st.accuracy,
      })),
      studyMaterials,
      recommendedTests,
      revisionAssignments,
    };
  }
}
