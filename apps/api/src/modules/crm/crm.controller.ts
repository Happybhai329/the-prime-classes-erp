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
import { Permission, LeadStatus, LeadSource } from '@prime/shared-types';
import { CrmService } from './crm.service';
import { CurrentUser, Permissions, Public } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('CRM & Lead Management')
@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // --- PUBLIC ENDPOINTS ---

  @Post('leads/public')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit lead public inquiry (landing page form)' })
  async createPublicLead(
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() body: { firstName: string; lastName: string; email?: string; phone?: string; notes?: string; source?: LeadSource; metaData?: any },
  ) {
    return this.crmService.createLead(tenantId, {
      ...body,
      source: body.source || LeadSource.WEBSITE_FORM,
      status: LeadStatus.INQUIRY,
    });
  }

  // --- LEADS ---

  @Get('leads')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.LEAD_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List leads with pagination, filters, and search' })
  async findAllLeads(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: LeadStatus;
      source?: LeadSource;
      counselorId?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    return this.crmService.findAllLeads(tenantId, query);
  }

  @Get('leads/:id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.LEAD_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detailed lead record with activity history' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findLeadById(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.crmService.findLeadById(tenantId, id);
  }

  @Post('leads')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.LEAD_WRITE)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Manually capture a lead' })
  async createLead(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.crmService.createLead(tenantId, body, userId);
  }

  @Patch('leads/:id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.LEAD_WRITE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lead status or details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async updateLead(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    return this.crmService.updateLead(tenantId, id, body, userId);
  }

  @Delete('leads/:id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.LEAD_DELETE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a lead record' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async deleteLead(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.crmService.deleteLead(tenantId, id);
  }

  @Post('leads/:id/assign')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.LEAD_ASSIGN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign counselor to a lead' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async assignLead(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('counselorId', ParseUUIDPipe) counselorId: string,
  ) {
    return this.crmService.assignLead(tenantId, id, counselorId, userId);
  }

  // --- ACTIVITIES ---

  @Post('leads/:id/activities')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.LEAD_WRITE)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log a communication follow-up or status check' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async logActivity(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    return this.crmService.logActivity(tenantId, id, body, userId);
  }

  // --- COUNSELORS WORKSPACE ---

  @Get('counselors/dashboard')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.COUNSELOR_DASHBOARD_VIEW)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get counselor dashboard workload & tasks' })
  async getCounselorDashboard(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.crmService.getCounselorDashboard(tenantId, userId);
  }

  @Get('counselors')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.COUNSELOR_MANAGE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all counselors' })
  async listCounselors(@CurrentUser('tenantId') tenantId: string) {
    return this.crmService.listCounselors(tenantId);
  }

  @Post('counselors')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.COUNSELOR_MANAGE)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a counselor' })
  async createCounselor(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: { userId: string },
  ) {
    return this.crmService.createCounselor(tenantId, body);
  }

  @Delete('counselors/:id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.COUNSELOR_MANAGE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a counselor profile' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async deactivateCounselor(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.crmService.deactivateCounselor(tenantId, id);
  }
}
