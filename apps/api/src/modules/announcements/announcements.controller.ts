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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto, QueryAnnouncementDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Announcements')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @Permissions(Permission.ANNOUNCEMENT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new announcement' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.announcementsService.create(tenantId, userId, dto);
  }

  @Get()
  @Permissions(Permission.ANNOUNCEMENT_VIEW)
  @ApiOperation({ summary: 'List all announcements' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryAnnouncementDto,
  ) {
    return this.announcementsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.ANNOUNCEMENT_VIEW)
  @ApiOperation({ summary: 'Get announcement detail' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.announcementsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Permissions(Permission.ANNOUNCEMENT_CREATE) // Re-using create perm for edits
  @ApiOperation({ summary: 'Update an announcement' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.ANNOUNCEMENT_CREATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an announcement' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.announcementsService.remove(tenantId, id);
  }
}
