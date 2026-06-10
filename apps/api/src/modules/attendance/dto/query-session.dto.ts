import { IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceSessionType } from '@prime/shared-types';
import { PaginationQueryDto } from '../../../common/dto';

export class QuerySessionDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by faculty who took attendance' })
  @IsOptional()
  @IsUUID()
  takenBy?: string;

  @ApiPropertyOptional({ enum: AttendanceSessionType })
  @IsOptional()
  @IsEnum(AttendanceSessionType)
  sessionType?: AttendanceSessionType;
}
