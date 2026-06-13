import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsNumber, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OnlineTestMode } from '@prime/shared-types';
import { Type } from 'class-transformer';

export class DifficultyMix {
  @ApiProperty({ example: 5 })
  @IsNumber()
  EASY!: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  MEDIUM!: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  HARD!: number;
}

export class AutoGenerateTestDto {
  @ApiProperty({ example: 'e3b0c442-98fc-11e9-a2a3-2a2ae2dbc6e0' })
  @IsUUID()
  @IsNotEmpty()
  batchId!: string;

  @ApiProperty({ example: 'e3b0c442-98fc-11e9-a2a3-2a2ae2dbc6e0' })
  @IsUUID()
  @IsNotEmpty()
  subjectId!: string;

  @ApiProperty({ example: 'Auto-Generated Math Practice 1' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ enum: OnlineTestMode, example: OnlineTestMode.PRACTICE })
  @IsEnum(OnlineTestMode)
  @IsNotEmpty()
  testMode!: OnlineTestMode;

  @ApiProperty({ example: 45 })
  @IsNumber()
  @Type(() => Number)
  durationMinutes!: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Type(() => Number)
  totalMarks!: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Type(() => Number)
  passingMarks!: number;

  @ApiPropertyOptional({ example: 0.0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  negativeMarking?: number;

  @ApiProperty({ example: '2026-06-20T14:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  scheduledStart!: string;

  @ApiProperty({ example: '2026-06-20T16:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  scheduledEnd!: string;

  @ApiProperty({ type: DifficultyMix })
  @IsObject()
  @IsNotEmpty()
  difficultyMix!: DifficultyMix;
}
