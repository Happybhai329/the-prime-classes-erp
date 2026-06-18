import { IsOptional, IsUUID, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto';
import { OnlineTestMode } from '@prime/shared-types';
import { Transform } from 'class-transformer';

export class QueryOnlineTestDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiPropertyOptional({ enum: OnlineTestMode })
  @IsOptional()
  @IsEnum(OnlineTestMode)
  testMode?: OnlineTestMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublished?: boolean;
}
