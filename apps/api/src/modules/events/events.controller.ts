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
import { Permission, EventType } from '@prime/shared-types';
import { EventsService } from './events.service';
import { CurrentUser, Permissions, Public } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Events & Scholarship Tests')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // --- PUBLIC ENDPOINTS ---

  @Post(':id/register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register for a seminar, event, or scholarship test' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async register(
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    return this.eventsService.registerForEvent(tenantId, id, body);
  }

  @Get('admit-card')
  @Public()
  @ApiOperation({ summary: 'Get admit card details for scholarship exam' })
  async getAdmitCard(
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
    @Query('rollNumber') rollNumber: string,
  ) {
    return this.eventsService.getAdmitCardData(tenantId, rollNumber);
  }

  @Post('registrations/:id/feedback')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit feedback for a completed event' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async submitFeedback(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { rating: number; feedback: string },
  ) {
    return this.eventsService.submitFeedback(id, body);
  }

  // --- ADMIN & MANAGEMENT ENDPOINTS ---

  @Get()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.EVENT_MANAGE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all events for the tenant' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: { page?: number; limit?: number; type?: EventType; search?: string },
  ) {
    return this.eventsService.findAllEvents(tenantId, query);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.EVENT_MANAGE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get details of a specific event and its registrations' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.eventsService.findEventById(tenantId, id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.EVENT_MANAGE)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new seminar, meeting, or scholarship test' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    return this.eventsService.createEvent(tenantId, body);
  }

  @Post('registrations/:registrationId/attendance')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.EVENT_MANAGE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check-in or mark attendance for an attendee' })
  @ApiParam({ name: 'registrationId', type: 'string', format: 'uuid' })
  async markAttendance(
    @CurrentUser('tenantId') tenantId: string,
    @Param('registrationId', ParseUUIDPipe) registrationId: string,
    @Body('status') status: boolean,
  ) {
    return this.eventsService.markAttendance(tenantId, registrationId, status);
  }

  @Post('registrations/:registrationId/score')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.EVENT_SCORE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record scholarship test result marks' })
  @ApiParam({ name: 'registrationId', type: 'string', format: 'uuid' })
  async recordScore(
    @CurrentUser('tenantId') tenantId: string,
    @Param('registrationId', ParseUUIDPipe) registrationId: string,
    @Body('score') score: number,
  ) {
    return this.eventsService.recordExamScore(tenantId, registrationId, score);
  }
}
