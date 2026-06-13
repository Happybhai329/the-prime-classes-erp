import { IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveAttemptStateDto {
  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  resumeState!: any;
}
