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
import { BatchesService } from './batches.service';
import {
  CreateBatchDto,
  UpdateBatchDto,
  QueryBatchDto,
  AddStudentsDto,
  TransferStudentDto,
} from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Batches')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get()
  @Permissions(Permission.BATCH_READ)
  @ApiOperation({ summary: 'List batches with pagination and filters' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryBatchDto,
  ) {
    return this.batchesService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.BATCH_READ)
  @ApiOperation({ summary: 'Get batch details with students and subjects' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.batchesService.findOne(tenantId, id);
  }

  @Post()
  @Permissions(Permission.BATCH_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new batch' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateBatchDto,
  ) {
    return this.batchesService.create(tenantId, dto);
  }

  @Patch(':id')
  @Permissions(Permission.BATCH_WRITE)
  @ApiOperation({ summary: 'Update batch details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBatchDto,
  ) {
    return this.batchesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.BATCH_DELETE)
  @ApiOperation({ summary: 'Deactivate a batch' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.batchesService.remove(tenantId, id);
  }

  @Post(':id/students')
  @Permissions(Permission.BATCH_WRITE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add students to batch' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async addStudents(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddStudentsDto,
  ) {
    return this.batchesService.addStudents(tenantId, id, dto);
  }

  @Delete(':id/students/:studentId')
  @Permissions(Permission.BATCH_WRITE)
  @ApiOperation({ summary: 'Remove student from batch' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'studentId', type: 'string', format: 'uuid' })
  async removeStudent(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    return this.batchesService.removeStudent(tenantId, id, studentId);
  }

  @Post(':id/transfer')
  @Permissions(Permission.BATCH_WRITE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transfer student to another batch' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async transferStudent(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferStudentDto,
  ) {
    return this.batchesService.transferStudent(tenantId, id, dto);
  }
}
