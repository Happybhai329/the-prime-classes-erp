import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GradeSubmissionDto {
  @ApiProperty({ example: 8.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  score!: number;

  @ApiPropertyOptional({ example: 'Good job on the proofs, clean work.' })
  @IsOptional()
  @IsString()
  feedback?: string;
}
