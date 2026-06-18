import {
  Controller,
  Get,
  Post,
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
import { AchievementsService } from './achievements.service';
import { QueryLeaderboardDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Leaderboard & Gamification')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('achievements')
export class AchievementsController {
  constructor(
    private readonly achievementsService: AchievementsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: "Get currently logged-in student's XP level progress and badges" })
  async getOwnProfile(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ) {
    if (role !== UserRole.STUDENT && role !== UserRole.PARENT) {
      throw new BadRequestException('XP profile is only applicable for students or parents');
    }

    let studentId: string | undefined;

    if (role === UserRole.STUDENT) {
      const student = await this.prisma.student.findUnique({ where: { userId } });
      studentId = student?.id;
    } else {
      // Parent context: resolve first child
      const parent = await this.prisma.parent.findFirst({
        where: { userId, tenantId },
        include: { studentMappings: true },
      });
      studentId = parent?.studentMappings[0]?.studentId;
    }

    if (!studentId) throw new BadRequestException('Student profile not found');

    return this.achievementsService.getStudentProfile(tenantId, studentId);
  }

  @Get('profile/:studentId')
  @Permissions(Permission.STUDENT_READ)
  @ApiOperation({ summary: 'Get student XP level progress and badges by student ID (Faculty/Admin)' })
  @ApiParam({ name: 'studentId', type: 'string', format: 'uuid' })
  async getStudentProfile(
    @CurrentUser('tenantId') tenantId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    return this.achievementsService.getStudentProfile(tenantId, studentId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'List leaderboard ranked by XP points, accuracy, attendance, or marks' })
  async getLeaderboard(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryLeaderboardDto,
  ) {
    return this.achievementsService.getLeaderboard(tenantId, query);
  }

  @Post('student/:studentId/badge')
  @Permissions(Permission.ACHIEVEMENT_MANAGE)
  @ApiOperation({ summary: 'Manually grant a badge to a student (Admin/Faculty)' })
  @ApiParam({ name: 'studentId', type: 'string', format: 'uuid' })
  async grantBadge(
    @CurrentUser('tenantId') tenantId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Body('badgeName') badgeName: string,
    @Body('description') description: string,
  ) {
    return this.achievementsService.grantBadge(tenantId, studentId, badgeName, description);
  }

  @Post('student/:studentId/check')
  @ApiOperation({ summary: 'Auto-scan student records to reward qualifying milestone badges' })
  @ApiParam({ name: 'studentId', type: 'string', format: 'uuid' })
  async autoCheckMilestones(
    @CurrentUser('tenantId') tenantId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    return this.achievementsService.autoCheckMilestones(tenantId, studentId);
  }
}
