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
import { Permission, UserRole } from '@prime/shared-types';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto, AdminResetPasswordDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions(Permission.USER_READ)
  @ApiOperation({ summary: 'List users with pagination, search, and role filter' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryUserDto,
  ) {
    return this.usersService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.USER_READ)
  @ApiOperation({ summary: 'Get user details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.findOne(tenantId, id);
  }

  @Post()
  @Permissions(Permission.USER_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.create(tenantId, dto);
  }

  @Patch(':id')
  @Permissions(Permission.USER_WRITE)
  @ApiOperation({ summary: 'Update user details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.USER_DELETE)
  @ApiOperation({ summary: 'Soft-delete a user' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.remove(tenantId, id);
  }

  @Patch(':id/toggle-active')
  @Permissions(Permission.USER_WRITE)
  @ApiOperation({ summary: 'Activate or deactivate a user' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async toggleActive(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.toggleActive(tenantId, id);
  }

  @Post(':id/reset-password')
  @Permissions(Permission.USER_WRITE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin-initiated password reset' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async resetPassword(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminResetPasswordDto,
  ) {
    return this.usersService.adminResetPassword(tenantId, id, dto);
  }

  @Patch(':id/assign-role')
  @Permissions(Permission.USER_WRITE)
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async assignRole(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('role') role: UserRole,
  ) {
    return this.usersService.assignRole(tenantId, id, role);
  }
}
