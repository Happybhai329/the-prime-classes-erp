import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { StudentFeesService } from './services/student-fees.service';
import { AssignFeeDto, BulkAssignFeeDto, QueryStudentFeesDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Student Fees')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('fees/student-fees')
export class StudentFeesController {
  constructor(private readonly studentFeesService: StudentFeesService) {}

  @Get()
  @Permissions(Permission.FEE_VIEW_ALL)
  @ApiOperation({ summary: 'List all student fee assignments with filters' })
  async findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: QueryStudentFeesDto) {
    return this.studentFeesService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.FEE_VIEW_ALL)
  @ApiOperation({ summary: 'Get student fee detail with installments, payments, discounts' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.studentFeesService.findOne(tenantId, id);
  }

  @Get('student/:studentId')
  @Permissions(Permission.FEE_VIEW_ALL, Permission.FEE_VIEW_OWN)
  @ApiOperation({ summary: 'Get all fee records for a specific student' })
  @ApiParam({ name: 'studentId', type: 'string', format: 'uuid' })
  async getByStudent(@CurrentUser('tenantId') tenantId: string, @Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.studentFeesService.getStudentFeesByStudentId(tenantId, studentId);
  }

  @Post('assign')
  @Permissions(Permission.FEE_INVOICE_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign a fee plan to a student' })
  async assign(@CurrentUser('tenantId') tenantId: string, @CurrentUser('id') userId: string, @Body() dto: AssignFeeDto) {
    return this.studentFeesService.assign(tenantId, userId, dto);
  }

  @Post('bulk-assign')
  @Permissions(Permission.FEE_INVOICE_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk assign a fee plan to multiple students or an entire batch' })
  async bulkAssign(@CurrentUser('tenantId') tenantId: string, @CurrentUser('id') userId: string, @Body() dto: BulkAssignFeeDto) {
    return this.studentFeesService.bulkAssign(tenantId, userId, dto);
  }
}
