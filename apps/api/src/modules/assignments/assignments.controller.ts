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
  UseInterceptors,
  UploadedFile,
  Req,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { Permission, UserRole } from '@prime/shared-types';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, UpdateAssignmentDto, QueryAssignmentDto, GradeSubmissionDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Permissions(Permission.ASSIGNMENT_CREATE)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new assignment (Faculty/Admin)' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateAssignmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.assignmentsService.create(tenantId, userId, dto, file);
  }

  @Patch(':id')
  @Permissions(Permission.ASSIGNMENT_CREATE)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update assignment details (Faculty/Admin)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssignmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.assignmentsService.update(tenantId, id, dto, file);
  }

  @Get()
  @ApiOperation({ summary: 'List assignments with role-based restrictions' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Query() query: QueryAssignmentDto,
  ) {
    let studentId: string | undefined;

    if (role === UserRole.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: { userId },
      });
      if (!student) throw new BadRequestException('Student profile not found');
      studentId = student.id;
    } else if (role === UserRole.PARENT) {
      const parent = await this.prisma.parent.findFirst({
        where: { userId, tenantId },
        include: { studentMappings: true },
      });
      studentId = parent?.studentMappings[0]?.studentId;
    }

    return this.assignmentsService.findAll(tenantId, query, {
      role,
      studentId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a single assignment' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    let studentId: string | undefined;

    if (role === UserRole.STUDENT) {
      const student = await this.prisma.student.findUnique({ where: { userId } });
      studentId = student?.id;
    }

    return this.assignmentsService.findOne(tenantId, id, studentId);
  }

  @Post(':id/submit')
  @Permissions(Permission.ASSIGNMENT_SUBMIT)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit homework for an assignment (Student)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async submit(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });
    if (!student) throw new BadRequestException('Student profile not found');

    return this.assignmentsService.submit(tenantId, id, student.id, file);
  }

  @Post(':id/grade/:studentId')
  @Permissions(Permission.ASSIGNMENT_REVIEW)
  @ApiOperation({ summary: 'Grade a student assignment submission (Faculty/Admin)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'studentId', type: 'string', format: 'uuid' })
  async grade(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') teacherUserId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.assignmentsService.grade(tenantId, id, studentId, teacherUserId, dto);
  }

  @Delete(':id')
  @Permissions(Permission.ASSIGNMENT_CREATE)
  @ApiOperation({ summary: 'Delete an assignment' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.assignmentsService.remove(tenantId, id);
  }
}
