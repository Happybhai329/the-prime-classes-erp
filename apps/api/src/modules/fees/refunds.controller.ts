import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { RefundsService } from './services/refunds.service';
import { DiscountsService } from './services/discounts.service';
import { CreateRefundDto, UpdateRefundStatusDto, QueryRefundsDto, ApplyDiscountDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Fee Refunds & Discounts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('fees')
export class RefundsController {
  constructor(
    private readonly refundsService: RefundsService,
    private readonly discountsService: DiscountsService,
  ) {}

  // ─── Refunds ───────────────────────────────────────────────

  @Get('refunds')
  @Permissions(Permission.FEE_REFUND_MANAGE)
  @ApiOperation({ summary: 'List all refund requests' })
  async findAllRefunds(@CurrentUser('tenantId') tenantId: string, @Query() query: QueryRefundsDto) {
    return this.refundsService.findAll(tenantId, query);
  }

  @Post('refunds')
  @Permissions(Permission.FEE_REFUND_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a refund request' })
  async createRefund(@CurrentUser('tenantId') tenantId: string, @CurrentUser('id') userId: string, @Body() dto: CreateRefundDto) {
    return this.refundsService.create(tenantId, userId, dto);
  }

  @Patch('refunds/:id/status')
  @Permissions(Permission.FEE_REFUND_APPROVE)
  @ApiOperation({ summary: 'Update refund status (approve/reject/process)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async updateRefundStatus(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRefundStatusDto,
  ) {
    return this.refundsService.updateStatus(tenantId, userId, id, dto);
  }

  // ─── Discounts ─────────────────────────────────────────────

  @Post('discounts')
  @Permissions(Permission.FEE_DISCOUNT_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Apply a discount/scholarship to a student fee' })
  async applyDiscount(@CurrentUser('tenantId') tenantId: string, @CurrentUser('id') userId: string, @Body() dto: ApplyDiscountDto) {
    return this.discountsService.applyDiscount(tenantId, userId, dto);
  }

  @Delete('discounts/:id')
  @Permissions(Permission.FEE_DISCOUNT_MANAGE)
  @ApiOperation({ summary: 'Remove a discount from a student fee' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async removeDiscount(@CurrentUser('tenantId') tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.discountsService.removeDiscount(tenantId, userId, id);
  }

  @Get('siblings/:studentId')
  @Permissions(Permission.FEE_DISCOUNT_MANAGE)
  @ApiOperation({ summary: 'Detect siblings for sibling discount eligibility' })
  @ApiParam({ name: 'studentId', type: 'string', format: 'uuid' })
  async detectSiblings(@CurrentUser('tenantId') tenantId: string, @Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.discountsService.detectSiblings(tenantId, studentId);
  }
}
