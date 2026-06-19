import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketCategory, TicketStatus } from '@prime/shared-types';

export class CreateTicketDto {
  @ApiProperty({ example: 'Unable to view attendance report' })
  @IsString()
  @MinLength(5, { message: 'Subject must be at least 5 characters' })
  @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  subject!: string;

  @ApiProperty({ enum: TicketCategory })
  @IsEnum(TicketCategory, { message: 'Invalid ticket category' })
  category!: TicketCategory;

  @ApiProperty({ example: 'I cannot see the attendance report for last week' })
  @IsString()
  @MinLength(10, { message: 'Message must be at least 10 characters' })
  @MaxLength(5000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  message!: string;
}

export class ReplyTicketDto {
  @ApiProperty({ example: 'We are looking into this issue' })
  @IsString()
  @MinLength(1, { message: 'Reply message is required' })
  @MaxLength(5000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  message!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: TicketStatus })
  @IsEnum(TicketStatus, { message: 'Invalid ticket status' })
  status!: TicketStatus;
}

export class AssignTicketDto {
  @ApiProperty()
  @IsUUID()
  assigneeId!: string;
}

export class QueryTicketsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({ enum: TicketCategory })
  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 20);
  }

  get take(): number {
    return this.limit || 20;
  }
}
