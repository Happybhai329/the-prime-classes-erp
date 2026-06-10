import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { ParentsService } from './parents.service';
import { UpdateParentDto, QueryParentDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Parents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get()
  @Permissions(Permission.PARENT_READ)
  @ApiOperation({ summary: 'List parents with pagination and search' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryParentDto,
  ) {
    return this.parentsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.PARENT_READ)
  @ApiOperation({ summary: 'Get parent details with linked students' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.parentsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Permissions(Permission.PARENT_WRITE)
  @ApiOperation({ summary: 'Update parent contact information' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateParentDto,
  ) {
    return this.parentsService.update(tenantId, id, dto);
  }
}
