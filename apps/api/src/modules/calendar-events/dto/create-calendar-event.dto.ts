import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CalendarEventType } from '@prime/shared-types';

export class CreateCalendarEventDto {
  @ApiProperty({ example: 'Diwali Holiday' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ example: 'Institute closed for Diwali celebrations' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-10-20T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({ example: '2026-10-25T23:59:59.000Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @ApiProperty({ enum: CalendarEventType, example: 'HOLIDAY' })
  @IsEnum(CalendarEventType)
  @IsNotEmpty()
  eventType!: CalendarEventType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  batchId?: string;
}
