import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignFeeDto {
  @ApiProperty()
  @IsUUID()
  feeStructureId!: string;

  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty({ example: '2026-27' })
  @IsString()
  academicYear!: string;
}

export class BulkAssignFeeDto {
  @ApiProperty()
  @IsUUID()
  feeStructureId!: string;

  @ApiProperty({ example: '2026-27' })
  @IsString()
  academicYear!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  batchId?: string;
}
