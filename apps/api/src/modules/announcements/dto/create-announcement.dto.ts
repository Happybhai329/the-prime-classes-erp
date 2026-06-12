import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnnouncementCategory } from '@prime/shared-types';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Annual Sports Day 2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ example: 'We are thrilled to announce our Annual Sports Day...' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ enum: AnnouncementCategory, example: AnnouncementCategory.GENERAL })
  @IsEnum(AnnouncementCategory)
  category!: AnnouncementCategory;

  @ApiPropertyOptional({ type: [String], description: 'List of attachment URLs' })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  attachmentUrls?: string[];

  @ApiPropertyOptional({ example: '2026-06-15T10:00:00Z', description: 'Schedule publish date' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
