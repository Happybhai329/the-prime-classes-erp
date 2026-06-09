import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StudentStatus, TargetExam } from '@prime/shared-types';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class QueryStudentDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: StudentStatus })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiPropertyOptional({ enum: TargetExam })
  @IsOptional()
  @IsEnum(TargetExam)
  targetExam?: TargetExam;
}
