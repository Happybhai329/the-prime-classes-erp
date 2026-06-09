import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferStudentDto {
  @ApiProperty({ description: 'Student ID to transfer' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'Target batch ID' })
  @IsUUID()
  targetBatchId!: string;
}
