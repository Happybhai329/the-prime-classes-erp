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
import { FollowUpsService } from './followups.service';
import { CreateFollowUpDto, UpdateFollowUpDto, QueryFollowUpDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Sales Follow-ups')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('sales/followups')
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Get()
  @Permissions(Permission.FOLLOWUP_READ)
  @ApiOperation({ summary: 'List follow-ups' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryFollowUpDto,
  ) {
    return this.followUpsService.findAll(tenantId, query);
  }

  @Get('dashboard')
  @Permissions(Permission.FOLLOWUP_READ)
  @ApiOperation({ summary: "Get follow-ups grouped for dashboard (today's, upcoming, missed)" })
  async getDashboardFollowUps(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.followUpsService.getDashboardFollowUps(tenantId, userId);
  }

  @Get('timeline/:enquiryId')
  @Permissions(Permission.FOLLOWUP_READ)
  @ApiOperation({ summary: 'Get follow-up timeline for an enquiry' })
  @ApiParam({ name: 'enquiryId', type: 'string', format: 'uuid' })
  async getTimeline(
    @CurrentUser('tenantId') tenantId: string,
    @Param('enquiryId', ParseUUIDPipe) enquiryId: string,
  ) {
    return this.followUpsService.getTimeline(tenantId, enquiryId);
  }

  @Get(':id')
  @Permissions(Permission.FOLLOWUP_READ)
  @ApiOperation({ summary: 'Get follow-up details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.followUpsService.findOne(tenantId, id);
  }

  @Post()
  @Permissions(Permission.FOLLOWUP_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log a new follow-up' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateFollowUpDto,
  ) {
    return this.followUpsService.create(tenantId, dto, userId);
  }

  @Patch(':id')
  @Permissions(Permission.FOLLOWUP_WRITE)
  @ApiOperation({ summary: 'Update follow-up' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFollowUpDto,
  ) {
    return this.followUpsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.FOLLOWUP_DELETE)
  @ApiOperation({ summary: 'Delete a follow-up' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.followUpsService.remove(tenantId, id);
  }
}
