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
import { CounsellorsService } from './counsellors.service';
import { CreateCounsellorDto, UpdateCounsellorDto, QueryCounsellorDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Sales Counsellors')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('sales/counsellors')
export class CounsellorsController {
  constructor(private readonly counsellorsService: CounsellorsService) {}

  @Get()
  @Permissions(Permission.COUNSELLOR_READ)
  @ApiOperation({ summary: 'List all counsellors' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryCounsellorDto,
  ) {
    return this.counsellorsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.COUNSELLOR_READ)
  @ApiOperation({ summary: 'Get counsellor details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.counsellorsService.findOne(tenantId, id);
  }

  @Post()
  @Permissions(Permission.COUNSELLOR_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new counsellor' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateCounsellorDto,
  ) {
    return this.counsellorsService.create(tenantId, dto);
  }

  @Patch(':id')
  @Permissions(Permission.COUNSELLOR_WRITE)
  @ApiOperation({ summary: 'Update counsellor details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCounsellorDto,
  ) {
    return this.counsellorsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.COUNSELLOR_DELETE)
  @ApiOperation({ summary: 'Remove a counsellor' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.counsellorsService.remove(tenantId, id);
  }
}
