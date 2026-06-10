import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class QueryParentDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by linked student ID' })
  @IsOptional()
  studentId?: string;
}
