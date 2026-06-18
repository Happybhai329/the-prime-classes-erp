import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class QueryFacultyDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by specialization keyword' })
  @IsOptional()
  @IsString()
  specialization?: string;
}
