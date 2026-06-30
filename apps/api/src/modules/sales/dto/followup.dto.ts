import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFollowUpDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  enquiryId!: string;

  @ApiProperty({ example: '2026-06-30' })
  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @ApiPropertyOptional({ example: '2026-07-05' })
  @IsOptional()
  @IsDateString()
  nextFollowUp?: string;

  @ApiProperty({ example: 'Call' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiPropertyOptional({ example: 'Student is interested in Sainik School mock exams' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ example: 'PENDING' })
  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  executiveId?: string;
}

export class UpdateFollowUpDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  enquiryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  nextFollowUp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  executiveId?: string;
}
