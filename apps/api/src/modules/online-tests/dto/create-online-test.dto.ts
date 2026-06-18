import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsNumber, IsDateString, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OnlineTestMode } from '@prime/shared-types';
import { Type } from 'class-transformer';

export class CreateOnlineTestDto {
  @ApiProperty({ example: 'e3b0c442-98fc-11e9-a2a3-2a2ae2dbc6e0' })
  @IsUUID()
  @IsNotEmpty()
  batchId!: string;

  @ApiPropertyOptional({ example: 'e3b0c442-98fc-11e9-a2a3-2a2ae2dbc6e0' })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiProperty({ example: 'Sainik School Math Mock Test 1' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Complete paper covering Algebra & Geometry' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: OnlineTestMode, example: OnlineTestMode.MOCK })
  @IsEnum(OnlineTestMode)
  @IsNotEmpty()
  testMode!: OnlineTestMode;

  @ApiProperty({ example: 60 })
  @IsNumber()
  @Type(() => Number)
  durationMinutes!: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Type(() => Number)
  totalMarks!: number;

  @ApiProperty({ example: 40 })
  @IsNumber()
  @Type(() => Number)
  passingMarks!: number;

  @ApiPropertyOptional({ example: 0.25 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  negativeMarking?: number;

  @ApiProperty({ example: '2026-06-20T10:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  scheduledStart!: string;

  @ApiProperty({ example: '2026-06-20T12:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  scheduledEnd!: string;

  @ApiPropertyOptional({ type: [String], description: 'Optional list of pre-selected Question IDs' })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  questionIds?: string[];

  @ApiPropertyOptional({ description: 'Optional sectional timing configurations' })
  @IsOptional()
  sectionalSettings?: any; // json input: [{ sectionName, durationMinutes, questionsCount }]

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
