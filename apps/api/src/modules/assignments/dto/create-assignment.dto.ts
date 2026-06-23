import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString, MaxLength, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { AssignmentType } from '@prime/shared-types';

export class CreateAssignmentDto {
  @ApiProperty({ example: 'Algebra Worksheet 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ example: 'Solve all quadratic equation questions' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'e3b0c442-98fc-11e9-a2a3-2a2ae2dbc6e0' })
  @IsUUID()
  @IsNotEmpty()
  batchId!: string;

  @ApiProperty({ example: 'e3b0c442-98fc-11e9-a2a3-2a2ae2dbc6e0' })
  @IsUUID()
  @IsNotEmpty()
  subjectId!: string;

  @ApiProperty({ example: '2026-06-20T23:59:59.000Z' })
  @IsDateString()
  @IsNotEmpty()
  deadline!: string;

  @ApiPropertyOptional({ enum: AssignmentType, example: 'ASSIGNMENT' })
  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublished?: boolean;
}
