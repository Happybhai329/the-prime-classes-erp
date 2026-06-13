import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DifficultyLevel, QuestionType, TargetExam } from '@prime/shared-types';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
  @ApiProperty({ example: 'e3b0c442-98fc-11e9-a2a3-2a2ae2dbc6e0' })
  @IsUUID()
  @IsNotEmpty()
  subjectId!: string;

  @ApiProperty({ example: 'Quadratic Equations' })
  @IsString()
  @IsNotEmpty()
  topic!: string;

  @ApiProperty({ enum: DifficultyLevel, example: DifficultyLevel.MEDIUM })
  @IsEnum(DifficultyLevel)
  @IsNotEmpty()
  difficulty!: DifficultyLevel;

  @ApiProperty({ example: 4.0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  marks!: number;

  @ApiProperty({ enum: QuestionType, example: QuestionType.MCQ })
  @IsEnum(QuestionType)
  @IsNotEmpty()
  questionType!: QuestionType;

  @ApiProperty({ example: 'What is the sum of roots of x^2 - 5x + 6 = 0?' })
  @IsString()
  @IsNotEmpty()
  questionText!: string;

  @ApiPropertyOptional({ example: ['2', '3', '5', '6'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiProperty({ example: '5' })
  @IsString()
  @IsNotEmpty()
  correctAnswer!: string;

  @ApiPropertyOptional({ example: 'Sum of roots of ax^2 + bx + c = 0 is -b/a.' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ example: ['equations', 'algebra'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: TargetExam, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TargetExam, { each: true })
  examTypes?: TargetExam[];
}

import { Min } from 'class-validator';
