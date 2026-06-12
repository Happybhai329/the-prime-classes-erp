import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AnnouncementCategory } from '@prime/shared-types';
import { PaginationQueryDto } from '../../../common/dto';

export class QueryAnnouncementDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AnnouncementCategory })
  @IsOptional()
  @IsEnum(AnnouncementCategory)
  category?: AnnouncementCategory;
}
