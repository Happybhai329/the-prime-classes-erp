import { IsOptional, IsString, MaxLength, IsEmail, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateParentDto {
  @ApiProperty({ example: 'parent@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: 'Prime@123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'Rajesh Kumar' })
  @IsString()
  @MaxLength(100)
  fatherName!: string;

  @ApiPropertyOptional({ example: 'Sunita Kumar' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  motherName?: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @MaxLength(20)
  fatherPhone!: string;

  @ApiPropertyOptional({ example: '9876543211' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  motherPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fatherOccupation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  motherOccupation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergencyContact?: string;
}
