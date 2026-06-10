import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  IsUUID,
  IsNumber,
  IsPositive,
  Min,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestType } from '@prime/shared-types';

export class CreateTestDto {
  @ApiProperty({ example: 'Sainik School Mock Test - June 2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ enum: TestType, example: TestType.MOCK })
  @IsEnum(TestType)
  testType!: TestType;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  batchId!: string;

  @ApiProperty({ type: [String], description: 'Subject UUIDs' })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  subjectIds!: string[];

  @ApiProperty({ example: 200 })
  @IsNumber()
  @IsPositive()
  totalMarks!: number;

  @ApiPropertyOptional({ example: 120, description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMinutes?: number;

  @ApiProperty({ example: '2026-06-15' })
  @IsDateString()
  testDate!: string;
}
