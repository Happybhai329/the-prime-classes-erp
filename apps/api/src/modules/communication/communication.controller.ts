import {
  Controller,
  Get,
  Post,
  Patch,
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
import { Permission, TicketStatus } from '@prime/shared-types';
import { CommunicationService } from './communication.service';
import { CreateTicketDto, ReplyTicketDto, QueryTicketDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Communication / Tickets')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('tickets')
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Post()
  @Permissions(Permission.TICKET_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new support ticket' })
  async createTicket(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTicketDto,
  ) {
    return this.communicationService.createTicket(tenantId, userId, dto);
  }

  @Get()
  @Permissions(Permission.TICKET_VIEW_OWN)
  @ApiOperation({ summary: 'List user\'s own tickets' })
  async getMyTickets(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Query() query: QueryTicketDto,
  ) {
    return this.communicationService.getMyTickets(tenantId, userId, query);
  }

  @Get('all')
  @Permissions(Permission.TICKET_VIEW_ALL)
  @ApiOperation({ summary: 'List all tickets (admin)' })
  async getAllTickets(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryTicketDto,
  ) {
    return this.communicationService.getAllTickets(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.TICKET_VIEW_OWN)
  @ApiOperation({ summary: 'Get ticket detail with messages' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getTicketDetail(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const isAdmin = role === 'ADMIN' || role === 'FACULTY'; // Based on real permissions in a full app, you might check roles differently, but this is a simplified check.
    return this.communicationService.getTicketDetail(tenantId, id, userId, isAdmin);
  }

  @Post(':id/reply')
  @Permissions(Permission.TICKET_VIEW_OWN) // You need to be able to view it to reply
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Reply to a ticket' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async replyToTicket(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: ReplyTicketDto,
  ) {
    return this.communicationService.replyToTicket(tenantId, id, userId, dto);
  }

  @Patch(':id/status')
  @Permissions(Permission.TICKET_RESPOND)
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async updateStatus(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TicketStatus,
  ) {
    return this.communicationService.updateStatus(tenantId, id, status);
  }

  @Patch(':id/assign')
  @Permissions(Permission.TICKET_VIEW_ALL) // Admins can assign
  @ApiOperation({ summary: 'Assign ticket to user' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async assignTicket(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('assigneeId', ParseUUIDPipe) assigneeId: string,
  ) {
    return this.communicationService.assignTicket(tenantId, id, assigneeId);
  }
}
