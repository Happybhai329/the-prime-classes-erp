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
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission, UserRole } from '@prime/shared-types';
import { OnlineTestsService } from './online-tests.service';
import { CreateOnlineTestDto, AutoGenerateTestDto, UpdateOnlineTestDto, QueryOnlineTestDto, SubmitAttemptDto, SaveAttemptStateDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Online Tests Platform')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('online-tests')
export class OnlineTestsController {
  constructor(
    private readonly onlineTestsService: OnlineTestsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Permissions(Permission.ONLINE_TEST_MANAGE)
  @ApiOperation({ summary: 'Schedule a new online test paper manually' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateOnlineTestDto,
  ) {
    return this.onlineTestsService.create(tenantId, dto);
  }

  @Post('auto')
  @Permissions(Permission.ONLINE_TEST_MANAGE)
  @ApiOperation({ summary: 'Auto-generate a balanced online test paper' })
  async autoGenerate(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: AutoGenerateTestDto,
  ) {
    return this.onlineTestsService.autoGenerate(tenantId, dto);
  }

  @Patch(':id')
  @Permissions(Permission.ONLINE_TEST_MANAGE)
  @ApiOperation({ summary: 'Update online test configuration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOnlineTestDto,
  ) {
    return this.onlineTestsService.update(tenantId, id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List scheduled online tests with role boundaries' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Query() query: QueryOnlineTestDto,
  ) {
    let studentId: string | undefined;

    if (role === UserRole.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: { userId },
      });
      if (!student) throw new BadRequestException('Student profile not found');
      studentId = student.id;
    }

    return this.onlineTestsService.findAll(tenantId, query, studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get online test details including questions' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.onlineTestsService.findOne(tenantId, id);
  }

  // ──────────────────────────────────────────────────
  // ENGINE SESSION INTERACTION (START, SAVE STATE, SUBMIT)
  // ──────────────────────────────────────────────────

  @Post(':id/start')
  @Permissions(Permission.ONLINE_TEST_TAKE)
  @ApiOperation({ summary: 'Start a test attempt (initializes status: IN_PROGRESS or resumes)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async startAttempt(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });
    if (!student) throw new BadRequestException('Student profile not found');

    return this.onlineTestsService.startAttempt(tenantId, id, student.id);
  }

  @Post('attempts/:attemptId/state')
  @Permissions(Permission.ONLINE_TEST_TAKE)
  @ApiOperation({ summary: 'Auto-save answers state during exam sessions' })
  @ApiParam({ name: 'attemptId', type: 'string', format: 'uuid' })
  async saveState(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() dto: SaveAttemptStateDto,
  ) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });
    if (!student) throw new BadRequestException('Student profile not found');

    return this.onlineTestsService.saveState(tenantId, attemptId, student.id, dto);
  }

  @Post('attempts/:attemptId/submit')
  @Permissions(Permission.ONLINE_TEST_TAKE)
  @ApiOperation({ summary: 'Submit attempt responses, score marks, and calculate performance' })
  @ApiParam({ name: 'attemptId', type: 'string', format: 'uuid' })
  async submitAttempt(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() dto: SubmitAttemptDto,
  ) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });
    if (!student) throw new BadRequestException('Student profile not found');

    return this.onlineTestsService.submitAttempt(tenantId, attemptId, student.id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.ONLINE_TEST_MANAGE)
  @ApiOperation({ summary: 'Delete an online test definition' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.onlineTestsService.remove(tenantId, id);
  }
}
