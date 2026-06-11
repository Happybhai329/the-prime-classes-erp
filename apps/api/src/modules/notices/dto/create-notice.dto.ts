import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NoticePriority, NoticeTargetAudience } from '@prime/shared-types';

export class CreateNoticeDto {
  @ApiProperty({ example: 'Holiday Notice - Republic Day' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ example: 'The institute will remain closed on 26th January.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: NoticePriority, example: NoticePriority.NORMAL })
  @IsEnum(NoticePriority)
  priority!: NoticePriority;

  @ApiProperty({ enum: NoticeTargetAudience, example: NoticeTargetAudience.ALL })
  @IsEnum(NoticeTargetAudience)
  targetAudience!: NoticeTargetAudience;

  @ApiPropertyOptional({ type: [String], description: 'Batch UUIDs (when targeting specific batches)' })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  batchIds?: string[];

  @ApiProperty({ example: '2026-06-12' })
  @IsDateString()
  publishDate!: string;

  @ApiPropertyOptional({ example: '2026-07-12' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
