import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RefundStatus } from '@prime/shared-types';

export class CreateRefundDto {
  @ApiProperty()
  @IsUUID()
  studentFeeId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  paymentId?: string;

  @ApiProperty({ example: 5000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @ApiProperty()
  @IsString()
  reason!: string;
}

export class UpdateRefundStatusDto {
  @ApiProperty({ enum: RefundStatus })
  @IsEnum(RefundStatus)
  status!: RefundStatus;
}
