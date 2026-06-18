import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import {
  CreateKnowledgeBaseArticleDto,
  CreateSlaPolicyDto,
} from './dto/support-desk.dto';
import { SupportDeskService } from './support-desk.service';

@ApiTags('Enterprise Support Desk')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('support-desk')
export class SupportDeskController {
  constructor(private readonly service: SupportDeskService) {}

  @Post('sla-policies')
  @Permissions(Permission.ENTERPRISE_SECURITY_MANAGE)
  async createSlaPolicy(@Body() dto: CreateSlaPolicyDto) {
    return {
      success: true,
      data: await this.service.createSlaPolicy(dto),
      message: 'SLA policy created successfully',
    };
  }

  @Get('organizations/:organizationId/sla-policies')
  @Permissions(Permission.TICKET_VIEW_ALL)
  async listSlaPolicies(@Param('organizationId') organizationId: string) {
    return {
      success: true,
      data: await this.service.listSlaPolicies(organizationId),
      message: 'SLA policies retrieved successfully',
    };
  }

  @Get('organizations/:organizationId/tickets')
  @Permissions(Permission.TICKET_VIEW_ALL)
  async listTickets(@Param('organizationId') organizationId: string) {
    return {
      success: true,
      data: await this.service.listEnterpriseTickets(organizationId),
      message: 'Enterprise tickets retrieved successfully',
    };
  }

  @Post('organizations/:organizationId/escalate-overdue')
  @Permissions(Permission.TICKET_RESPOND)
  async escalateOverdue(@Param('organizationId') organizationId: string) {
    return {
      success: true,
      data: await this.service.escalateOverdueTickets(organizationId),
      message: 'Overdue ticket escalation completed successfully',
    };
  }

  @Post('knowledge-base')
  @Permissions(Permission.ENTERPRISE_SECURITY_MANAGE)
  async createArticle(@Body() dto: CreateKnowledgeBaseArticleDto) {
    return {
      success: true,
      data: await this.service.createArticle(dto),
      message: 'Knowledge base article created successfully',
    };
  }

  @Get('knowledge-base')
  async listArticles(
    @Query('organizationId') organizationId?: string,
    @Query('publishedOnly') publishedOnly?: string,
  ) {
    return {
      success: true,
      data: await this.service.listArticles(
        organizationId,
        publishedOnly === 'true',
      ),
      message: 'Knowledge base articles retrieved successfully',
    };
  }
}
