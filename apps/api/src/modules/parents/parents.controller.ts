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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { ParentsService } from './parents.service';
import { CreateParentDto, UpdateParentDto, QueryParentDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Parents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Post()
  @Permissions(Permission.PARENT_WRITE)
  @ApiOperation({ summary: 'Create a new parent account and profile' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateParentDto,
  ) {
    return this.parentsService.create(tenantId, dto);
  }

  @Get('search')
  @Permissions(Permission.PARENT_READ)
  @ApiOperation({ summary: 'Search parents by name, email or phone' })
  async search(
    @CurrentUser('tenantId') tenantId: string,
    @Query('q') query: string,
  ) {
    return this.parentsService.search(tenantId, query);
  }

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

