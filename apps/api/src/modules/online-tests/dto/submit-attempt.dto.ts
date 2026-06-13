import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ResponseItem {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  questionId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  selectedAnswer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  timeSpentSeconds?: number;
}

export class SubmitAttemptDto {
  @ApiProperty({ type: [ResponseItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseItem)
  responses!: ResponseItem[];
}
