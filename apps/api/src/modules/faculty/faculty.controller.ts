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
import { FacultyService } from './faculty.service';
import { CreateFacultyDto, UpdateFacultyDto, QueryFacultyDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Faculty')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get()
  @Permissions(Permission.FACULTY_READ)
  @ApiOperation({ summary: 'List faculty with pagination, search, and specialization filter' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryFacultyDto,
  ) {
    return this.facultyService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.FACULTY_READ)
  @ApiOperation({ summary: 'Get faculty details with batch-subject assignments' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.facultyService.findOne(tenantId, id);
  }

  @Post()
  @Permissions(Permission.FACULTY_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new faculty member (also creates User account)' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateFacultyDto,
  ) {
    return this.facultyService.create(tenantId, dto);
  }

  @Patch(':id')
  @Permissions(Permission.FACULTY_WRITE)
  @ApiOperation({ summary: 'Update faculty details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFacultyDto,
  ) {
    return this.facultyService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.FACULTY_WRITE)
  @ApiOperation({ summary: 'Remove faculty (deactivates user account)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.facultyService.remove(tenantId, id);
  }

  @Post(':id/assign-batch')
  @Permissions(Permission.FACULTY_WRITE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign faculty to teach a subject in a batch' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async assignToBatch(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('batchId', ParseUUIDPipe) batchId: string,
    @Body('subjectId', ParseUUIDPipe) subjectId: string,
  ) {
    return this.facultyService.assignToBatch(tenantId, id, batchId, subjectId);
  }

  @Delete(':id/batch-subject/:batchSubjectId')
  @Permissions(Permission.FACULTY_WRITE)
  @ApiOperation({ summary: 'Remove faculty from a batch-subject assignment' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'batchSubjectId', type: 'string', format: 'uuid' })
  async removeFromBatch(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('batchSubjectId', ParseUUIDPipe) batchSubjectId: string,
  ) {
    return this.facultyService.removeFromBatch(tenantId, id, batchSubjectId);
  }
}
