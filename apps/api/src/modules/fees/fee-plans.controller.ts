import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { FeePlansService } from './services/fee-plans.service';
import { CreateFeePlanDto, UpdateFeePlanDto, QueryFeePlansDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Fee Plans')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('fees/plans')
export class FeePlansController {
  constructor(private readonly feePlansService: FeePlansService) {}

  @Get()
  @Permissions(Permission.FEE_VIEW_ALL)
  @ApiOperation({ summary: 'List all fee plans with filters' })
  async findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: QueryFeePlansDto) {
    return this.feePlansService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.FEE_VIEW_ALL)
  @ApiOperation({ summary: 'Get fee plan details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.feePlansService.findOne(tenantId, id);
  }

  @Post()
  @Permissions(Permission.FEE_STRUCTURE_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new fee plan' })
  async create(@CurrentUser('tenantId') tenantId: string, @CurrentUser('id') userId: string, @Body() dto: CreateFeePlanDto) {
    return this.feePlansService.create(tenantId, userId, dto);
  }

  @Patch(':id')
  @Permissions(Permission.FEE_STRUCTURE_MANAGE)
  @ApiOperation({ summary: 'Update a fee plan' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFeePlanDto,
  ) {
    return this.feePlansService.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.FEE_STRUCTURE_MANAGE)
  @ApiOperation({ summary: 'Delete or deactivate a fee plan' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(@CurrentUser('tenantId') tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.feePlansService.remove(tenantId, userId, id);
  }
}
