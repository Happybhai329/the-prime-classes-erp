import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Permission, ROLE_PERMISSIONS, UserRole } from '@prime/shared-types';
import { TicketsService } from './tickets.service';
import {
  CreateTicketDto,
  ReplyTicketDto,
  UpdateTicketStatusDto,
  AssignTicketDto,
  QueryTicketsDto,
} from './dto/tickets.dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Support Desk Tickets')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('support-desk/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Permissions(Permission.TICKET_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a support ticket' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTicketDto,
  ) {
    return {
      success: true,
      data: await this.ticketsService.create(tenantId, userId, dto),
      message: 'Ticket created successfully',
    };
  }

  @Get()
  @Permissions(Permission.TICKET_VIEW_OWN)
  @ApiOperation({ summary: 'Get current user\'s tickets' })
  async findMyTickets(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Query() query: QueryTicketsDto,
  ) {
    const result = await this.ticketsService.findMyTickets(tenantId, userId, query);
    return {
      success: true,
      ...result,
      message: 'My tickets retrieved successfully',
    };
  }

  @Get('all')
  @Permissions(Permission.TICKET_VIEW_ALL)
  @ApiOperation({ summary: 'Get all support tickets (admin/faculty)' })
  async findAllTickets(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryTicketsDto,
  ) {
    const result = await this.ticketsService.findAllTickets(tenantId, query);
    return {
      success: true,
      ...result,
      message: 'All tickets retrieved successfully',
    };
  }

  @Get(':id')
  @Permissions(Permission.TICKET_VIEW_OWN)
  @ApiOperation({ summary: 'Get ticket details' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const ticket = await this.ticketsService.findOne(tenantId, id, userId);
    const isOwner = ticket.createdBy === userId || ticket.assignedTo === userId;
    const hasViewAll =
      user.role === UserRole.SUPER_ADMIN ||
      (ROLE_PERMISSIONS[user.role as UserRole] || []).includes(Permission.TICKET_VIEW_ALL);

    if (!hasViewAll && !isOwner) {
      throw new ForbiddenException('You do not have permission to view this ticket');
    }

    return {
      success: true,
      data: ticket,
      message: 'Ticket details retrieved successfully',
    };
  }

  @Post(':id/reply')
  @Permissions(Permission.TICKET_VIEW_OWN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Reply to a ticket' })
  async reply(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplyTicketDto,
  ) {
    const ticket = await this.ticketsService.findOne(tenantId, id, userId);
    const isOwner = ticket.createdBy === userId;
    const hasRespondPerm =
      user.role === UserRole.SUPER_ADMIN ||
      (ROLE_PERMISSIONS[user.role as UserRole] || []).includes(Permission.TICKET_RESPOND);

    if (!isOwner && !hasRespondPerm) {
      throw new ForbiddenException('You do not have permission to reply to this ticket');
    }

    return {
      success: true,
      data: await this.ticketsService.reply(tenantId, id, userId, dto),
      message: 'Reply posted successfully',
    };
  }

  @Patch(':id/status')
  @Permissions(Permission.TICKET_VIEW_OWN)
  @ApiOperation({ summary: 'Update ticket status' })
  async updateStatus(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    const ticket = await this.ticketsService.findOne(tenantId, id, userId);
    const isOwner = ticket.createdBy === userId;
    const hasRespondPerm =
      user.role === UserRole.SUPER_ADMIN ||
      (ROLE_PERMISSIONS[user.role as UserRole] || []).includes(Permission.TICKET_RESPOND);

    if (!isOwner && !hasRespondPerm) {
      throw new ForbiddenException('You do not have permission to update status of this ticket');
    }

    return {
      success: true,
      data: await this.ticketsService.updateStatus(tenantId, id, dto.status),
      message: 'Ticket status updated successfully',
    };
  }

  @Patch(':id/assign')
  @Permissions(Permission.TICKET_RESPOND)
  @ApiOperation({ summary: 'Assign ticket to an agent' })
  async assign(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTicketDto,
  ) {
    return {
      success: true,
      data: await this.ticketsService.assign(tenantId, id, dto.assigneeId),
      message: 'Ticket assigned successfully',
    };
  }
}
