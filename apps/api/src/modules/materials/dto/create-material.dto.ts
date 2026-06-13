import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMaterialDto {
  @ApiProperty({ example: 'Introduction to Calculus' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ example: 'Notes and equations for calculus limits' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'e3b0c442-98fc-11e9-a2a3-2a2ae2dbc6e0' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'e3b0c442-98fc-11e9-a2a3-2a2ae2dbc6e0' })
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiPropertyOptional({ example: 'e3b0c442-98fc-11e9-a2a3-2a2ae2dbc6e0' })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiPropertyOptional({ example: 'SAINIK' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  course?: string;

  @ApiPropertyOptional({ example: 'Algebra' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  chapter?: string;

  @ApiPropertyOptional({ example: 'Linear Equations' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  topic?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
