import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TargetExam } from '@prime/shared-types';

export class UpdateSubjectDto {
  @ApiPropertyOptional({ example: 'Advanced Mathematics' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'MATH102' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'Code must contain only uppercase letters, numbers, hyphens, and underscores',
  })
  code?: string;

  @ApiPropertyOptional({ example: [TargetExam.SAINIK], enum: TargetExam, isArray: true })
  @IsArray()
  @IsOptional()
  @IsEnum(TargetExam, { each: true })
  targetExam?: TargetExam[];
}
