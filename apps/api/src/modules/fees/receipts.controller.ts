import { Controller, Get, Post, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { ReceiptsService } from './services/receipts.service';
import { QueryReceiptsDto } from './dto';
import { CurrentUser, Permissions, Public } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Fee Receipts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('fees/receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get()
  @Permissions(Permission.FEE_RECEIPT_VIEW)
  @ApiOperation({ summary: 'List all receipts with filters' })
  async findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: QueryReceiptsDto) {
    return this.receiptsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions(Permission.FEE_RECEIPT_VIEW)
  @ApiOperation({ summary: 'Get receipt details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.receiptsService.findOne(tenantId, id);
  }

  @Post('generate/:paymentId')
  @Permissions(Permission.FEE_COLLECT)
  @ApiOperation({ summary: 'Generate a receipt for a payment' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  async generate(@CurrentUser('tenantId') tenantId: string, @Param('paymentId', ParseUUIDPipe) paymentId: string) {
    return this.receiptsService.generateReceipt(tenantId, paymentId);
  }

  @Get('verify/:paymentId')
  @Public()
  @ApiOperation({ summary: 'Verify a receipt by payment ID (public endpoint)' })
  @ApiParam({ name: 'paymentId', type: 'string', format: 'uuid' })
  async verify(@Param('paymentId', ParseUUIDPipe) paymentId: string) {
    return this.receiptsService.verifyReceipt(paymentId);
  }
}
