import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { AttendanceService } from './attendance.service';
import {
  CreateSessionDto,
  BulkAttendanceDto,
  UpdateSessionDto,
  QuerySessionDto,
  QueryReportDto,
} from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ── Sessions ──────────────────────────────────────

  @Post('sessions')
  @Permissions(Permission.ATTENDANCE_MARK)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create attendance session and mark attendance' })
  async createSession(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.attendanceService.createSession(tenantId, userId, dto);
  }

  @Post('sessions/bulk')
  @Permissions(Permission.ATTENDANCE_MARK)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk mark attendance for multiple batches' })
  async createBulkSessions(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: BulkAttendanceDto,
  ) {
    return this.attendanceService.createBulkSessions(tenantId, userId, dto);
  }

  @Get('sessions')
  @Permissions(Permission.ATTENDANCE_READ_ALL)
  @ApiOperation({ summary: 'List attendance sessions with filters' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QuerySessionDto,
  ) {
    return this.attendanceService.findAll(tenantId, query);
  }

  @Get('sessions/:id')
  @Permissions(Permission.ATTENDANCE_READ_ALL)
  @ApiOperation({ summary: 'Get attendance session detail with records' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.attendanceService.findOne(tenantId, id);
  }

  @Patch('sessions/:id')
  @Permissions(Permission.ATTENDANCE_MARK)
  @ApiOperation({ summary: 'Update attendance records for a session' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async updateSession(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.attendanceService.updateSession(tenantId, id, dto);
  }

  @Post('sessions/:id/finalize')
  @Permissions(Permission.ATTENDANCE_MARK)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalize attendance session (lock from edits)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async finalizeSession(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.attendanceService.finalizeSession(tenantId, id);
  }

  // ── Dashboard ─────────────────────────────────────

  @Get('dashboard')
  @Permissions(Permission.ATTENDANCE_READ_ALL)
  @ApiOperation({ summary: 'Get attendance dashboard statistics' })
  async getDashboard(@CurrentUser('tenantId') tenantId: string) {
    return this.attendanceService.getDashboard(tenantId);
  }

  // ── Reports ───────────────────────────────────────

  @Get('reports/daily')
  @Permissions(Permission.ATTENDANCE_REPORT)
  @ApiOperation({ summary: 'Daily attendance report' })
  async getDailyReport(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryReportDto,
  ) {
    return this.attendanceService.getDailyReport(tenantId, query);
  }

  @Get('reports/monthly')
  @Permissions(Permission.ATTENDANCE_REPORT)
  @ApiOperation({ summary: 'Monthly attendance report' })
  async getMonthlyReport(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryReportDto,
  ) {
    return this.attendanceService.getMonthlyReport(tenantId, query);
  }

  @Get('reports/student/:id')
  @Permissions(Permission.ATTENDANCE_READ_ALL)
  @ApiOperation({ summary: 'Student-wise attendance report' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getStudentReport(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryReportDto,
  ) {
    return this.attendanceService.getStudentReport(tenantId, id, query);
  }

  @Get('reports/batch/:id')
  @Permissions(Permission.ATTENDANCE_REPORT)
  @ApiOperation({ summary: 'Batch-wise attendance report' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getBatchReport(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryReportDto,
  ) {
    return this.attendanceService.getBatchReport(tenantId, id, query);
  }

  // ── Analytics ─────────────────────────────────────

  @Get('analytics')
  @Permissions(Permission.ATTENDANCE_REPORT)
  @ApiOperation({ summary: 'Attendance analytics — trends, defaulters, perfect attendance' })
  async getAnalytics(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryReportDto,
  ) {
    return this.attendanceService.getAnalytics(tenantId, query);
  }
}
