import { IsOptional, IsString, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto';
import {
  FeeType,
  InstallmentType,
  StudentFeeStatus,
  InvoiceStatus,
  PaymentMode,
  RefundStatus,
} from '@prime/shared-types';

export class QueryFeePlansDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: FeeType })
  @IsOptional()
  @IsEnum(FeeType)
  feeType?: FeeType;

  @ApiPropertyOptional({ enum: InstallmentType })
  @IsOptional()
  @IsEnum(InstallmentType)
  installmentType?: InstallmentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isActive?: string; // 'true' | 'false'
}

export class QueryStudentFeesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: StudentFeeStatus })
  @IsOptional()
  @IsEnum(StudentFeeStatus)
  status?: StudentFeeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  feeStructureId?: string;
}

export class QueryPaymentsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: PaymentMode })
  @IsOptional()
  @IsEnum(PaymentMode)
  paymentMode?: PaymentMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;
}

export class QueryRefundsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: RefundStatus })
  @IsOptional()
  @IsEnum(RefundStatus)
  status?: RefundStatus;
}

export class QueryReceiptsDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

export class FeeReportQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  month?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  academicYear?: string;
}
