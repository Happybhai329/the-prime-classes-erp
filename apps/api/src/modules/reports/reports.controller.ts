import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission, TargetExam } from '@prime/shared-types';
import { ReportsService } from './reports.service';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('attendance/summary')
  @Permissions(Permission.REPORT_ALL)
  @ApiOperation({ summary: 'Attendance summary across all batches' })
  async getAttendanceSummary(@CurrentUser('tenantId') tenantId: string) {
    return this.reportsService.getAttendanceSummary(tenantId);
  }

  @Get('tests/summary')
  @Permissions(Permission.REPORT_ALL)
  @ApiOperation({ summary: 'Test performance summary' })
  async getTestsSummary(@CurrentUser('tenantId') tenantId: string) {
    return this.reportsService.getTestsSummary(tenantId);
  }

  @Get('merit-list')
  @Permissions(Permission.REPORT_ALL)
  @ApiOperation({ summary: 'Institute-wide merit list' })
  async getInstituteMeritList(@CurrentUser('tenantId') tenantId: string) {
    return this.reportsService.getInstituteMeritList(tenantId);
  }

  @Get('merit-list/batch/:batchId')
  @Permissions(Permission.REPORT_BATCH)
  @ApiOperation({ summary: 'Batch merit list' })
  @ApiParam({ name: 'batchId', type: 'string', format: 'uuid' })
  async getBatchMeritList(
    @CurrentUser('tenantId') tenantId: string,
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ) {
    return this.reportsService.getBatchMeritList(tenantId, batchId);
  }

  @Get('merit-list/exam/:examType')
  @Permissions(Permission.REPORT_ALL)
  @ApiOperation({ summary: 'Exam-specific merit list' })
  @ApiParam({ name: 'examType', enum: TargetExam })
  async getExamMeritList(
    @CurrentUser('tenantId') tenantId: string,
    @Param('examType') examType: TargetExam,
  ) {
    return this.reportsService.getExamMeritList(tenantId, examType);
  }

  @Get('student/:id/performance')
  @Permissions(Permission.REPORT_ALL, Permission.REPORT_OWN)
  @ApiOperation({ summary: 'Full student performance profile' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getStudentPerformanceProfile(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('role') role: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reportsService.getStudentPerformanceProfile(tenantId, id, { role, userId });
  }

  @Get('parent/children')
  @Permissions(Permission.REPORT_OWN)
  @ApiOperation({ summary: 'Parent portal data (children overview)' })
  async getParentChildrenData(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.reportsService.getParentChildrenData(tenantId, userId);
  }

  @Get('academic/overview')
  @Permissions(Permission.REPORT_ALL)
  @ApiOperation({ summary: 'Get overview of homework & assignments completion rates and engagement metrics' })
  async getAcademicOverviewReport(@CurrentUser('tenantId') tenantId: string) {
    return this.reportsService.getAcademicOverviewReport(tenantId);
  }
}
