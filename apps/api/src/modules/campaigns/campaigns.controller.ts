import {
  Controller,
  Get,
  Post,
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
import { Permission, CampaignType, CampaignChannel, CampaignStatus } from '@prime/shared-types';
import { CampaignsService } from './campaigns.service';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Marketing Automation Campaigns')
@Controller('campaigns')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@ApiBearerAuth()
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  @Permissions(Permission.CAMPAIGN_VIEW)
  @ApiOperation({ summary: 'List marketing campaigns' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: {
      page?: number;
      limit?: number;
      type?: CampaignType;
      channel?: CampaignChannel;
      status?: CampaignStatus;
    },
  ) {
    return this.campaignsService.findAllCampaigns(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.CAMPAIGN_VIEW)
  @ApiOperation({ summary: 'Get details and metrics of a campaign' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.campaignsService.findCampaignById(tenantId, id);
  }

  @Post()
  @Permissions(Permission.CAMPAIGN_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new marketing campaign template' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    return this.campaignsService.createCampaign(tenantId, body);
  }

  @Post(':id/trigger')
  @Permissions(Permission.CAMPAIGN_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually dispatch scheduled broadcasts to segmented leads list' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async trigger(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.campaignsService.triggerCampaign(tenantId, id);
  }
}
