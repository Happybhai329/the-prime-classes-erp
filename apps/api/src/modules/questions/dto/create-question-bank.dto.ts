import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionBankDto {
  @ApiProperty({ example: 'Sainik School Math 2026 Pool' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'Math questions selected for Sainik School exam practice' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'e3b0c442-98fc-11e9-a2a3-2a2ae2dbc6e0' })
  @IsUUID()
  @IsNotEmpty()
  subjectId!: string;
}
