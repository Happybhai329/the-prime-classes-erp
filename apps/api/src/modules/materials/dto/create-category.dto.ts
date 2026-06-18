import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Sainik Mock Papers' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}
