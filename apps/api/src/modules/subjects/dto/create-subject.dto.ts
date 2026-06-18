import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TargetExam } from '@prime/shared-types';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'MATH101' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'Code must contain only uppercase letters, numbers, hyphens, and underscores',
  })
  code!: string;

  @ApiProperty({ example: [TargetExam.FOUNDATION], enum: TargetExam, isArray: true })
  @IsArray()
  @IsEnum(TargetExam, { each: true })
  targetExam!: TargetExam[];
}
