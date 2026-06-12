import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { PaymentsService } from './services/payments.service';
import { RecordPaymentDto, PaymentAdjustmentDto, QueryPaymentsDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Fee Payments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('fees/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Permissions(Permission.FEE_VIEW_ALL)
  @ApiOperation({ summary: 'List all payments with filters' })
  async findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: QueryPaymentsDto) {
    return this.paymentsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.FEE_VIEW_ALL)
  @ApiOperation({ summary: 'Get payment details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(tenantId, id);
  }

  @Post()
  @Permissions(Permission.FEE_COLLECT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a new payment' })
  async recordPayment(@CurrentUser('tenantId') tenantId: string, @CurrentUser('id') userId: string, @Body() dto: RecordPaymentDto) {
    return this.paymentsService.recordPayment(tenantId, userId, dto);
  }

  @Post('adjust')
  @Permissions(Permission.FEE_COLLECT)
  @ApiOperation({ summary: 'Adjust an existing payment amount' })
  async adjustPayment(@CurrentUser('tenantId') tenantId: string, @CurrentUser('id') userId: string, @Body() dto: PaymentAdjustmentDto) {
    return this.paymentsService.adjustPayment(tenantId, userId, dto);
  }
}
