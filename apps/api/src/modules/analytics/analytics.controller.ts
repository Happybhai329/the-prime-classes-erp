import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Res,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { Response } from 'express';
import { PredictionService } from './services/prediction.service';
import { RecommendationService } from './services/recommendation.service';
import { PdfReportService } from './services/pdf-report.service';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly predictionService: PredictionService,
    private readonly recommendationService: RecommendationService,
    private readonly pdfReportService: PdfReportService,
  ) {}

  @Get('student/:id/prediction')
  @Permissions(Permission.REPORT_OWN, Permission.REPORT_BATCH, Permission.REPORT_ALL)
  @ApiOperation({ summary: 'Get student success prediction card' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getStudentPrediction(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return {
      status: 'success',
      data: await this.predictionService.scoreStudent(tenantId, id),
    };
  }

  @Get('student/:id/weak-topics')
  @Permissions(Permission.REPORT_OWN, Permission.REPORT_BATCH, Permission.REPORT_ALL)
  @ApiOperation({ summary: 'Get student weak topic metrics' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getStudentWeakTopics(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const recommendations = await this.recommendationService.getPersonalizedRecommendations(tenantId, id);
    return {
      status: 'success',
      data: {
        weakTopics: recommendations.weakTopics,
        strongTopics: recommendations.strongTopics,
      },
    };
  }

  @Get('student/:id/recommendations')
  @Permissions(Permission.REPORT_OWN, Permission.REPORT_BATCH, Permission.REPORT_ALL)
  @ApiOperation({ summary: 'Get student personalized revision paths' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getStudentRecommendations(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return {
      status: 'success',
      data: await this.recommendationService.getPersonalizedRecommendations(tenantId, id),
    };
  }

  @Get('student/:id/report/pdf')
  @Permissions(Permission.REPORT_OWN, Permission.REPORT_BATCH, Permission.REPORT_ALL)
  @ApiOperation({ summary: 'Download PDF Report Card' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async downloadPdfReport(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.pdfReportService.generateStudentReport(tenantId, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="student_report_${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('batch/:id/prediction')
  @Permissions(Permission.REPORT_BATCH, Permission.REPORT_ALL)
  @ApiOperation({ summary: 'Get batch prediction analytics' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getBatchPrediction(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const atRisk = await this.predictionService.getAtRiskStudents(tenantId, id);
    return {
      status: 'success',
      data: {
        batchId: id,
        atRiskStudents: atRisk,
        atRiskCount: atRisk.length,
      },
    };
  }

  @Get('batch/:id/risk-alerts')
  @Permissions(Permission.REPORT_BATCH, Permission.REPORT_ALL)
  @ApiOperation({ summary: 'Get faculty risk alerts for a batch' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getBatchRiskAlerts(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return {
      status: 'success',
      data: await this.predictionService.getAtRiskStudents(tenantId, id),
    };
  }

  @Get('admin/intelligence')
  @Permissions(Permission.REPORT_ALL)
  @ApiOperation({ summary: 'Get institute intelligence & forecasting' })
  async getAdminIntelligence(@CurrentUser('tenantId') tenantId: string) {
    return {
      status: 'success',
      data: await this.predictionService.getInstituteIntelligence(tenantId),
    };
  }

  @Get('questions/analytics')
  @Permissions(Permission.REPORT_ALL)
  @ApiOperation({ summary: 'Get question difficulty & response analytics' })
  async getQuestionAnalytics(@CurrentUser('tenantId') tenantId: string) {
    return {
      status: 'success',
      data: await this.predictionService.getQuestionAnalytics(tenantId),
    };
  }

  @Post('sync')
  @Permissions(Permission.REPORT_ALL)
  @ApiOperation({ summary: 'Trigger manual sync of data snapshots' })
  async triggerManualSync(@CurrentUser('tenantId') tenantId: string) {
    await this.predictionService.syncAllStudents(tenantId);
    return {
      status: 'success',
      message: 'Snapshot sync completed successfully.',
    };
  }
}
