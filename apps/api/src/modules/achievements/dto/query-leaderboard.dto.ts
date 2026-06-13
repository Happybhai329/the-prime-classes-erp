import { IsOptional, IsUUID, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum LeaderboardMetric {
  POINTS = 'POINTS',
  ACCURACY = 'ACCURACY',
  ATTENDANCE = 'ATTENDANCE',
  MARKS = 'MARKS',
}

export class QueryLeaderboardDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({ enum: LeaderboardMetric, default: LeaderboardMetric.POINTS })
  @IsOptional()
  @IsEnum(LeaderboardMetric)
  metric?: LeaderboardMetric;
}
