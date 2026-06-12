import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NoticePriority, NoticeTargetAudience } from '@prime/shared-types';
import { PaginationQueryDto } from '../../../common/dto';

export class QueryNoticeDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: NoticePriority })
  @IsOptional()
  @IsEnum(NoticePriority)
  priority?: NoticePriority;

  @ApiPropertyOptional({ enum: NoticeTargetAudience })
  @IsOptional()
  @IsEnum(NoticeTargetAudience)
  targetAudience?: NoticeTargetAudience;
}
