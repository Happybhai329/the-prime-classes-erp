import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Super Admin Portal')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), SuperAdminGuard)
@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('tenants')
  @ApiOperation({ summary: 'List all institutes/tenants with usage statistics' })
  async getTenants() {
    return {
      success: true,
      data: await this.superAdminService.getTenants(),
      message: 'Tenants retrieved successfully',
    };
  }

  @Patch('tenants/:id/status')
  @ApiOperation({ summary: 'Activate or suspend an institute tenant' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async toggleTenantStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { isActive: boolean }
  ) {
    const tenant = await this.superAdminService.toggleTenantStatus(id, body.isActive);
    return {
      success: true,
      data: tenant,
      message: `Tenant has been ${body.isActive ? 'activated' : 'suspended'} successfully`,
    };
  }

  @Get('plans')
  @ApiOperation({ summary: 'List SaaS plans and enabled features' })
  async getPlans() {
    return {
      success: true,
      data: await this.superAdminService.getPlans(),
      message: 'Plans retrieved successfully',
    };
  }

  @Post('tenants/:tenantId/upgrade')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upgrade or change plan for an institute tenant' })
  @ApiParam({ name: 'tenantId', type: 'string', format: 'uuid' })
  async upgradePlan(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() body: { planId: string }
  ) {
    const subscription = await this.superAdminService.upgradePlan(tenantId, body.planId);
    return {
      success: true,
      data: subscription,
      message: 'Tenant subscription updated successfully',
    };
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get overall revenue stats, monthly recurring revenue and invoices list' })
  async getRevenueStats() {
    return {
      success: true,
      data: await this.superAdminService.getRevenueStats(),
      message: 'Revenue analytics retrieved successfully',
    };
  }

  @Get('tickets')
  @ApiOperation({ summary: 'List support tickets across all tenants' })
  async getTickets() {
    return {
      success: true,
      data: await this.superAdminService.getTickets(),
      message: 'Support tickets retrieved successfully',
    };
  }

  @Post('tickets/:ticketId/respond')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Respond to and resolve a support ticket' })
  @ApiParam({ name: 'ticketId', type: 'string', format: 'uuid' })
  async respondToTicket(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @CurrentUser('sub') senderId: string,
    @Body() body: { content: string }
  ) {
    const ticket = await this.superAdminService.respondToTicket(ticketId, senderId, body.content);
    return {
      success: true,
      data: ticket,
      message: 'Ticket resolved and response recorded successfully',
    };
  }
}
