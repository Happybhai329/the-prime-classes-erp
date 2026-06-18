import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { Permissions } from '../../common/decorators';
import {
  OrganizationScope,
  OrganizationScopeGuard,
} from '../../common/enterprise';
import { PermissionsGuard } from '../../common/guards';
import {
  CreateFranchiseAgreementDto,
  CreateFranchiseInvoiceDto,
  CreateFranchiseOwnerDto,
  GenerateRoyaltyDto,
} from './dto/franchise-billing.dto';
import { FranchiseBillingService } from './franchise-billing.service';

@ApiTags('Franchise Billing')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard, OrganizationScopeGuard)
@Permissions(Permission.FRANCHISE_BILLING_MANAGE)
@OrganizationScope(Permission.FRANCHISE_BILLING_MANAGE)
@Controller('enterprise/organizations/:organizationId/franchise')
export class FranchiseBillingController {
  constructor(private readonly service: FranchiseBillingService) {}

  @Post('owners')
  @ApiOperation({ summary: 'Create a franchise owner' })
  async createOwner(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateFranchiseOwnerDto,
  ) {
    return {
      success: true,
      data: await this.service.createOwner(organizationId, dto),
      message: 'Franchise owner created successfully',
    };
  }

  @Get('owners')
  async listOwners(@Param('organizationId') organizationId: string) {
    return {
      success: true,
      data: await this.service.listOwners(organizationId),
      message: 'Franchise owners retrieved successfully',
    };
  }

  @Post('agreements')
  async createAgreement(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateFranchiseAgreementDto,
  ) {
    return {
      success: true,
      data: await this.service.createAgreement(organizationId, dto),
      message: 'Franchise agreement created successfully',
    };
  }

  @Get('agreements')
  async listAgreements(@Param('organizationId') organizationId: string) {
    return {
      success: true,
      data: await this.service.listAgreements(organizationId),
      message: 'Franchise agreements retrieved successfully',
    };
  }

  @Post('royalties/generate')
  async generateRoyalties(
    @Param('organizationId') organizationId: string,
    @Body() dto: GenerateRoyaltyDto,
  ) {
    return {
      success: true,
      data: await this.service.generateRoyalties(organizationId, dto),
      message: 'Royalty ledgers generated successfully',
    };
  }

  @Get('performance')
  async performance(
    @Param('organizationId') organizationId: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return {
      success: true,
      data: await this.service.getPerformance(organizationId, ownerId),
      message: 'Franchise performance retrieved successfully',
    };
  }

  @Post('invoices')
  async createInvoice(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateFranchiseInvoiceDto,
  ) {
    return {
      success: true,
      data: await this.service.createInvoice(organizationId, dto),
      message: 'Franchise invoice created successfully',
    };
  }

  @Get('invoices')
  async listInvoices(@Param('organizationId') organizationId: string) {
    return {
      success: true,
      data: await this.service.listInvoices(organizationId),
      message: 'Franchise invoices retrieved successfully',
    };
  }

  @Post('owners/:ownerId/statements')
  async generateStatement(
    @Param('organizationId') organizationId: string,
    @Param('ownerId') ownerId: string,
    @Body() dto: GenerateRoyaltyDto,
  ) {
    return {
      success: true,
      data: await this.service.generateStatement(organizationId, ownerId, dto),
      message: 'Franchise statement generated successfully',
    };
  }

  @Get('statements')
  async listStatements(
    @Param('organizationId') organizationId: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return {
      success: true,
      data: await this.service.listStatements(organizationId, ownerId),
      message: 'Franchise statements retrieved successfully',
    };
  }

  @Post('owners/:ownerId/payout-reports')
  async generatePayout(
    @Param('organizationId') organizationId: string,
    @Param('ownerId') ownerId: string,
    @Body() dto: GenerateRoyaltyDto,
  ) {
    return {
      success: true,
      data: await this.service.generatePayoutReport(
        organizationId,
        ownerId,
        dto,
      ),
      message: 'Payout report generated successfully',
    };
  }
}
