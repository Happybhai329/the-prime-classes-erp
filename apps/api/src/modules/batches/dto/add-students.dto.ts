import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddStudentsDto {
  @ApiProperty({ type: [String], description: 'Array of student UUIDs to add to batch' })
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds!: string[];
}
