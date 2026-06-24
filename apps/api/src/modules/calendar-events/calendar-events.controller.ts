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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { CalendarEventsService } from './calendar-events.service';
import { CreateCalendarEventDto, QueryCalendarEventDto, UpdateCalendarEventDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Calendar Events')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('calendar-events')
export class CalendarEventsController {
  constructor(private readonly calendarEventsService: CalendarEventsService) {}

  @Post()
  @Permissions(Permission.CALENDAR_EVENT_CREATE)
  @ApiOperation({ summary: 'Create a new calendar event (Admin/Faculty)' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateCalendarEventDto,
  ) {
    return this.calendarEventsService.create(tenantId, dto);
  }

  @Get()
  @Permissions(Permission.CALENDAR_EVENT_VIEW)
  @ApiOperation({ summary: 'List calendar events' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryCalendarEventDto,
  ) {
    return this.calendarEventsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.CALENDAR_EVENT_VIEW)
  @ApiOperation({ summary: 'Get details of a single calendar event' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.calendarEventsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Permissions(Permission.CALENDAR_EVENT_CREATE)
  @ApiOperation({ summary: 'Update calendar event details (Admin/Faculty)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCalendarEventDto,
  ) {
    return this.calendarEventsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.CALENDAR_EVENT_CREATE)
  @ApiOperation({ summary: 'Delete a calendar event (Admin/Faculty)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.calendarEventsService.remove(tenantId, id);
  }
}
