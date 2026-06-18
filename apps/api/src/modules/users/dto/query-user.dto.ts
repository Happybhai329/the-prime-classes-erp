import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prime/shared-types';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class QueryUserDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Filter active (true) or deactivated (false) users' })
  @IsOptional()
  isActive?: string; // query params arrive as strings, converted in service
}
