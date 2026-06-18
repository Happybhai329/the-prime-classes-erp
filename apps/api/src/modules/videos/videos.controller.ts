import {
  Controller,
  Get,
  Post,
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
import { VideosService } from './videos.service';
import { CreateVideoDto, QueryVideoDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Video Learning Architecture')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('videos')
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Permissions(Permission.MATERIAL_UPLOAD)
  @ApiOperation({ summary: 'Setup a new video lecture metadata resource (Faculty/Admin)' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateVideoDto,
  ) {
    return this.videosService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List available video lectures and streams' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Query() query: QueryVideoDto,
  ) {
    let studentId: string | undefined;

    if (role === UserRole.STUDENT) {
      const student = await this.prisma.student.findUnique({ where: { userId } });
      if (!student) throw new BadRequestException('Student profile not found');
      studentId = student.id;
    } else if (role === UserRole.PARENT) {
      const parent = await this.prisma.parent.findFirst({
        where: { userId, tenantId },
        include: { studentMappings: true },
      });
      studentId = parent?.studentMappings[0]?.studentId;
    }

    return this.videosService.findAll(tenantId, query, { role, studentId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a single video lecture' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.videosService.findOne(tenantId, id);
  }

  @Delete(':id')
  @Permissions(Permission.MATERIAL_DELETE)
  @ApiOperation({ summary: 'Remove a video lecture' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.videosService.remove(tenantId, id);
  }
}
