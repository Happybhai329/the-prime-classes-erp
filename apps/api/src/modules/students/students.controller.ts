import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { Permission } from '@prime/shared-types';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, QueryStudentDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Permissions(Permission.STUDENT_READ)
  @ApiOperation({ summary: 'List students with pagination, search, and filters' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryStudentDto,
  ) {
    return this.studentsService.findAll(tenantId, query);
  }

  @Get('export/csv')
  @Permissions(Permission.STUDENT_READ)
  @ApiOperation({ summary: 'Export students as CSV' })
  async exportCsv(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryStudentDto,
    @Res() res: Response,
  ) {
    const csv = await this.studentsService.exportCsv(tenantId, query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students-export.csv');
    res.send(csv);
  }

  @Get(':id')
  @Permissions(Permission.STUDENT_READ)
  @ApiOperation({ summary: 'Get student details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentsService.findOne(tenantId, id);
  }

  @Post()
  @Permissions(Permission.STUDENT_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new student' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateStudentDto,
  ) {
    return this.studentsService.create(tenantId, dto);
  }

  @Patch(':id')
  @Permissions(Permission.STUDENT_WRITE)
  @ApiOperation({ summary: 'Update student details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.STUDENT_DELETE)
  @ApiOperation({ summary: 'Soft-delete a student' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentsService.remove(tenantId, id);
  }

  @Get(':id/attendance-summary')
  @Permissions(Permission.STUDENT_READ)
  @ApiOperation({ summary: 'Get student attendance summary' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getAttendanceSummary(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentsService.getAttendanceSummary(tenantId, id);
  }

  @Get(':id/test-summary')
  @Permissions(Permission.STUDENT_READ)
  @ApiOperation({ summary: 'Get student test performance summary' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getTestSummary(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentsService.getTestSummary(tenantId, id);
  }

  @Get(':id/fee-summary')
  @Permissions(Permission.STUDENT_READ)
  @ApiOperation({ summary: 'Get student fee summary' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getFeeSummary(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentsService.getFeeSummary(tenantId, id);
  }
}
