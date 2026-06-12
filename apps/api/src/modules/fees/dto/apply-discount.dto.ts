import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType, DiscountMode } from '@prime/shared-types';

export class ApplyDiscountDto {
  @ApiProperty()
  @IsUUID()
  studentFeeId!: string;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @ApiProperty({ enum: DiscountMode })
  @IsEnum(DiscountMode)
  discountMode!: DiscountMode;

  @ApiProperty({ example: 10, description: 'Percentage value (0-100) or fixed amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
