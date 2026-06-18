import { Injectable, Logger } from '@nestjs/common';
// @ts-ignore
import * as PDFDocument from 'pdfkit';
import { PrismaService } from '../../../database/prisma.service';
import { PredictionService } from './prediction.service';
import { RecommendationService } from './recommendation.service';

@Injectable()
export class PdfReportService {
  private readonly logger = new Logger(PdfReportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly predictionService: PredictionService,
    private readonly recommendationService: RecommendationService,
  ) {}

  /**
   * Generate a PDF report buffer for a student
   */
  async generateStudentReport(tenantId: string, studentId: string): Promise<Buffer> {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId, deletedAt: null },
      include: {
        batchEnrollments: { include: { batch: true } },
      },
    });

    if (!student) {
      throw new Error(`Student not found`);
    }

    const prediction = await this.predictionService.scoreStudent(tenantId, studentId);
    const recommendations = await this.recommendationService.getPersonalizedRecommendations(tenantId, studentId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: any) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: any) => reject(err));

      // ----------------------------------------------------
      // DESIGN PALETTE
      // ----------------------------------------------------
      const primaryColor = '#1e293b'; // Slate Blue/Dark Charcoal
      const secondaryColor = '#0f172a'; // Deep Navy
      const accentColor = '#d97706'; // Gold/Amber
      const lightBg = '#f8fafc'; // Off-white
      const borderGray = '#cbd5e1';
      const textColor = '#334155';

      // ----------------------------------------------------
      // HEADER SECTION
      // ----------------------------------------------------
      doc.rect(0, 0, 595, 120).fill(primaryColor);
      
      doc.fillColor('#ffffff')
         .fontSize(22)
         .font('Helvetica-Bold')
         .text('THE PRIME CLASSES erp', 50, 40);

      doc.fillColor(accentColor)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('AI ACADEMIC INTELLIGENCE & PERFORMANCE PROFILE', 50, 70);

      doc.fillColor('#94a3b8')
         .fontSize(9)
         .font('Helvetica')
         .text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 450, 45, { align: 'right', width: 95 });

      doc.moveDown(4);

      // ----------------------------------------------------
      // STUDENT PROFILE BANNER
      // ----------------------------------------------------
      const profileTop = 140;
      doc.rect(50, profileTop, 495, 80).fill(lightBg);
      doc.rect(50, profileTop, 495, 80).stroke(borderGray);

      doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text(`${student.firstName} ${student.lastName}`, 70, profileTop + 15);
      doc.fillColor(textColor).fontSize(10).font('Helvetica').text(`Roll Number: ${student.rollNumber}`, 70, profileTop + 35);
      doc.text(`Batch: ${student.batchEnrollments[0]?.batch?.name || 'N/A'} (${student.batchEnrollments[0]?.batch?.code || ''})`, 70, profileTop + 50);
      
      const targetExamText = student.targetExam.join(', ');
      doc.text(`Target Exams: ${targetExamText || 'General Training'}`, 280, profileTop + 15);
      doc.text(`Status: ACTIVE`, 280, profileTop + 35);
      doc.text(`Academic Session: 2026-27`, 280, profileTop + 50);

      // ----------------------------------------------------
      // PREDICTION ENGINE METRICS
      // ----------------------------------------------------
      const metricsTop = 240;
      doc.rect(50, metricsTop, 235, 110).fill(lightBg);
      doc.rect(50, metricsTop, 235, 110).stroke(borderGray);

      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('EXAM SUCCESS PROBABILITY', 65, metricsTop + 15);
      doc.fillColor(accentColor).fontSize(44).font('Helvetica-Bold').text(`${prediction.successProbability}%`, 65, metricsTop + 35);
      
      let badgeColor = '#10b981'; // Green
      if (prediction.category === 'AT_RISK') badgeColor = '#ef4444';
      else if (prediction.category === 'MODERATE') badgeColor = '#f59e0b';
      
      doc.fillColor(badgeColor).fontSize(12).font('Helvetica-Bold').text(prediction.category, 160, metricsTop + 50);

      // Attendance
      doc.rect(310, metricsTop, 235, 110).fill(lightBg);
      doc.rect(310, metricsTop, 235, 110).stroke(borderGray);

      const attPercent = (prediction.features.attendanceRate * 100).toFixed(0);
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('ATTENDANCE RATE', 325, metricsTop + 15);
      doc.fillColor(textColor).fontSize(44).font('Helvetica-Bold').text(`${attPercent}%`, 325, metricsTop + 35);
      doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('Target: 75% for exam eligibility', 325, metricsTop + 85);

      // ----------------------------------------------------
      // KEY INDICATORS & EXPLANATIONS (Why this score?)
      // ----------------------------------------------------
      const triggersTop = 370;
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('AI PREDICTION INSIGHTS & TRIGGERS', 50, triggersTop);
      doc.strokeColor(accentColor).lineWidth(1).moveTo(50, triggersTop + 15).lineTo(545, triggersTop + 15).stroke();

      let expY = triggersTop + 25;
      for (const exp of prediction.explanations) {
        const bulletColor = exp.impact === 'positive' ? '#10b981' : exp.impact === 'negative' ? '#ef4444' : '#64748b';
        doc.circle(60, expY + 5, 3).fill(bulletColor);
        doc.fillColor(textColor).fontSize(9.5).font('Helvetica').text(`${exp.factor}: ${exp.description}`, 75, expY, { width: 450 });
        expY += 18;
      }

      // ----------------------------------------------------
      // WEAK TOPICS & REVISION STRATEGY
      // ----------------------------------------------------
      const weakTop = expY + 15;
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('WEAK TOPICS & PRESCRIBED REVISION', 50, weakTop);
      doc.strokeColor(accentColor).lineWidth(1).moveTo(50, weakTop + 15).lineTo(545, weakTop + 15).stroke();

      let weakY = weakTop + 25;
      if (recommendations.weakTopics.length > 0) {
        for (const wt of recommendations.weakTopics) {
          doc.fillColor('#ef4444').font('Helvetica-Bold').fontSize(9.5).text(`[Needs Review] ${wt.subjectName}`, 50, weakY);
          doc.fillColor(textColor).font('Helvetica').text(`Topic: ${wt.topic} (Accuracy: ${wt.accuracy}%)`, 180, weakY);
          weakY += 16;
        }
      } else {
        doc.fillColor(textColor).font('Helvetica').fontSize(10).text('No weak topics detected. Maintain current study routine.', 50, weakY);
        weakY += 20;
      }

      // ----------------------------------------------------
      // PERSONALIZED ACTION ITEMS
      // ----------------------------------------------------
      const actionTop = weakY + 15;
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('RECOMMENDED STUDY ACTION PLAN', 50, actionTop);
      doc.strokeColor(accentColor).lineWidth(1).moveTo(50, actionTop + 15).lineTo(545, actionTop + 15).stroke();

      let actY = actionTop + 25;
      // List mock tests to take
      if (recommendations.recommendedTests.length > 0) {
        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10).text('Attempt Suggested Mock Tests:', 50, actY);
        actY += 15;
        for (const test of recommendations.recommendedTests) {
          doc.fillColor(textColor).font('Helvetica').fontSize(9.5).text(`· ${test.title} (${test.subjectName}) - ${test.durationMinutes} Mins`, 65, actY);
          actY += 14;
        }
      }

      // List study materials to review
      if (recommendations.studyMaterials.length > 0) {
        actY += 5;
        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10).text('Review Prescribed Study Material:', 50, actY);
        actY += 15;
        for (const mat of recommendations.studyMaterials) {
          doc.fillColor(textColor).font('Helvetica').fontSize(9.5).text(`· ${mat.title} (${mat.subjectName}) - Topic: ${mat.topic}`, 65, actY);
          actY += 14;
        }
      }

      // Footer
      doc.rect(0, 780, 595, 62).fill(primaryColor);
      doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica').text('THE PRIME CLASSES — Military Academy ERP Analytics Engine', 50, 795);
      doc.text('Confidential - For Internal Faculty and Parental review only.', 50, 810);

      doc.end();
    });
  }
}
