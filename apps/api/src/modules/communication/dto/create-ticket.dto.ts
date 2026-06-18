import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupportPriority, TicketCategory } from '@prime/shared-types';

export class CreateTicketDto {
  @ApiProperty({ example: 'Query about attendance records' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject!: string;

  @ApiProperty({ enum: TicketCategory, example: TicketCategory.ATTENDANCE })
  @IsEnum(TicketCategory)
  category!: TicketCategory;

  @ApiProperty({ example: 'I noticed my childs attendance for 5th June is marked as absent but he was present.' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({ enum: SupportPriority, example: SupportPriority.NORMAL })
  @IsOptional()
  @IsEnum(SupportPriority)
  priority?: SupportPriority;
}
