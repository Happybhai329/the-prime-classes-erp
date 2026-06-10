import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceSessionType, AttendanceStatus } from '@prime/shared-types';

class AttendanceRecordDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateSessionDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  batchId!: string;

  @ApiProperty({ example: '2026-06-10' })
  @IsDateString()
  sessionDate!: string;

  @ApiProperty({ enum: AttendanceSessionType, example: AttendanceSessionType.MORNING })
  @IsEnum(AttendanceSessionType)
  sessionType!: AttendanceSessionType;

  @ApiPropertyOptional({ format: 'uuid', description: 'Required when sessionType is SUBJECT' })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiProperty({ type: [AttendanceRecordDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records!: AttendanceRecordDto[];
}
