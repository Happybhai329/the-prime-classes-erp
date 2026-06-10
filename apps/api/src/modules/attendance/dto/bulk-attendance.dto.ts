import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSessionDto } from './create-session.dto';

export class BulkAttendanceDto {
  @ApiProperty({ type: [CreateSessionDto], description: 'Multiple sessions to create at once' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSessionDto)
  sessions!: CreateSessionDto[];
}
