import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFacultyDto {
  @ApiPropertyOptional({ example: 'Rajesh' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Kumar' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: ['Mathematics', 'Physics'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialization?: string[];

  @ApiPropertyOptional({ example: 'Ph.D. Physics' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  qualification?: string;

  @ApiPropertyOptional({ example: 30000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;
}
