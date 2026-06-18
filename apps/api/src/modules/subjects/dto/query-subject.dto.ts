import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TargetExam } from '@prime/shared-types';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class QuerySubjectDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: TargetExam })
  @IsOptional()
  @IsEnum(TargetExam)
  targetExam?: TargetExam;
}
