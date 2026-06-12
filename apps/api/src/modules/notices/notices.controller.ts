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
import { NoticesService } from './notices.service';
import { CreateNoticeDto, UpdateNoticeDto, QueryNoticeDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Notices')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Post()
  @Permissions(Permission.NOTICE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new notice' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateNoticeDto,
  ) {
    return this.noticesService.create(tenantId, userId, dto);
  }

  @Get()
  @Permissions(Permission.NOTICE_VIEW)
  @ApiOperation({ summary: 'List all notices (admin/faculty)' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryNoticeDto,
  ) {
    return this.noticesService.findAll(tenantId, query);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get notices for current user (filtered by role/audience)' })
  async getMyNotices(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Query() query: QueryNoticeDto,
  ) {
    return this.noticesService.getMyNotices(tenantId, userId, role, query);
  }

  @Get(':id')
  @Permissions(Permission.NOTICE_VIEW)
  @ApiOperation({ summary: 'Get notice detail' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.noticesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Permissions(Permission.NOTICE_EDIT)
  @ApiOperation({ summary: 'Update a notice' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoticeDto,
  ) {
    return this.noticesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.NOTICE_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a notice' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.noticesService.remove(tenantId, id);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a notice as read' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async markRead(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.noticesService.markRead(tenantId, id, userId);
  }
}
