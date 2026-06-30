import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdmissionDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  enquiryId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  studentPhoto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  documents?: any;

  @ApiProperty({ example: '2026-06-30' })
  @IsDateString()
  @IsNotEmpty()
  admissionDate!: string;

  @ApiPropertyOptional({ example: 'Rimic Special Program' })
  @IsOptional()
  @IsString()
  program?: string;

  @ApiPropertyOptional({ example: 'RIMC' })
  @IsOptional()
  @IsString()
  course?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  feeStructure?: any;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  registrationFee?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  scholarship?: number;

  @ApiPropertyOptional({ example: 'PENDING' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'PENDING' })
  @IsOptional()
  @IsString()
  paymentStatus?: string;
}

export class UpdateAdmissionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  enquiryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  studentPhoto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  documents?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  admissionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  program?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  course?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  feeStructure?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  registrationFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  scholarship?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentStatus?: string;
}

export class EnrollStudentDto {
  @ApiProperty({ example: 'batch-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  batchId!: string;

  @ApiProperty({ example: 'Section A' })
  @IsString()
  @IsNotEmpty()
  section!: string;

  @ApiProperty({ example: 'PRM-2026-0001' })
  @IsString()
  @IsNotEmpty()
  rollNumber!: string;

  @ApiPropertyOptional({ example: 'fee-structure-uuid-here' })
  @IsOptional()
  @IsUUID()
  feeStructureId?: string;
}
