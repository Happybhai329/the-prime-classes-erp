import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsNumber, IsBoolean, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VideoProvider } from '@prime/shared-types';
import { Type } from 'class-transformer';

export class CreateVideoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiProperty({ example: 'Sainik School Reasoning Class 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ example: 'Introduction to spatial reasoning and patterns' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'tenant-1/videos/reasoning_class_1.mp4' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  videoUrl!: string;

  @ApiProperty({ enum: VideoProvider, example: VideoProvider.MINIO })
  @IsEnum(VideoProvider)
  @IsNotEmpty()
  provider!: VideoProvider;

  @ApiPropertyOptional({ example: 3600 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  durationSeconds?: number;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/thumbnails/1.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isLive?: boolean;

  @ApiPropertyOptional({ example: '2026-06-21T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledStart?: string;
}
