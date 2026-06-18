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
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto, UpdateSubjectDto, QuerySubjectDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Subjects')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @Permissions(Permission.SUBJECT_READ)
  @ApiOperation({ summary: 'List subjects with pagination, search, and targetExam filter' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QuerySubjectDto,
  ) {
    return this.subjectsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.SUBJECT_READ)
  @ApiOperation({ summary: 'Get subject details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.subjectsService.findOne(tenantId, id);
  }

  @Post()
  @Permissions(Permission.SUBJECT_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new subject master record' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateSubjectDto,
  ) {
    return this.subjectsService.create(tenantId, dto);
  }

  @Patch(':id')
  @Permissions(Permission.SUBJECT_WRITE)
  @ApiOperation({ summary: 'Update subject details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.SUBJECT_WRITE)
  @ApiOperation({ summary: 'Delete a subject' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.subjectsService.remove(tenantId, id);
  }
}
