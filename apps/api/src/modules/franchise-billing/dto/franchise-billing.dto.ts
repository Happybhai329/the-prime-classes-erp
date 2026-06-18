import {
  IsDateString,
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateFranchiseOwnerDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsObject()
  address?: Record<string, unknown>;
}

export class CreateFranchiseAgreementDto {
  @IsUUID()
  ownerId!: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsString()
  agreementNumber!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsNumber()
  @Min(0)
  franchiseFee!: number;

  @IsNumber()
  @Min(0)
  platformCharge!: number;

  @IsNumber()
  @Min(0)
  royaltyPercent!: number;

  @IsOptional()
  @IsObject()
  terms?: Record<string, unknown>;
}

export class GenerateRoyaltyDto {
  @IsDateString()
  periodStart!: string;

  @IsDateString()
  periodEnd!: string;
}

export class CreateFranchiseInvoiceDto {
  @IsUUID()
  ownerId!: string;

  @IsString()
  invoiceNumber!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsDateString()
  dueDate!: string;

  @IsOptional()
  lineItems?: unknown[];
}
