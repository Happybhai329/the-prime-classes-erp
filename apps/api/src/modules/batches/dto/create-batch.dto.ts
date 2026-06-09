import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsObject,
  IsUUID,
  MaxLength,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TargetExam } from '@prime/shared-types';

class BatchTimingDto {
  @ApiProperty({ example: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] })
  @IsArray()
  @IsString({ each: true })
  days: string[];

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '13:00' })
  @IsString()
  endTime: string;
}

export class CreateBatchDto {
  @ApiProperty({ example: 'Sainik School Foundation 2025' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'SSF-2025' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ enum: TargetExam, example: TargetExam.SAINIK })
  @IsEnum(TargetExam)
  targetExam: TargetExam;

  @ApiProperty({ example: '2025-2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  academicYear: string;

  @ApiProperty({ example: '2025-04-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-03-31' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  maxStrength?: number;

  @ApiPropertyOptional({ type: BatchTimingDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BatchTimingDto)
  timing?: BatchTimingDto;

  @ApiPropertyOptional({ description: 'Faculty ID for class teacher' })
  @IsOptional()
  @IsUUID()
  classTeacherId?: string;
}
