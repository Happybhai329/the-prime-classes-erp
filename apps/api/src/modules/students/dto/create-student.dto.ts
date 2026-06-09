import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  IsObject,
  MinLength,
  MaxLength,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, TargetExam } from '@prime/shared-types';

class AddressDto {
  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  @IsNotEmpty()
  street!: string;

  @ApiProperty({ example: 'Lucknow' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'Uttar Pradesh' })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty({ example: '226001' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  pincode!: string;
}

export class CreateStudentDto {
  @ApiProperty({ example: 'Arjun' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Singh' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: '2012-05-15' })
  @IsDateString()
  dob!: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender!: Gender;

  @ApiProperty({ example: 'Delhi Public School' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  schoolName!: string;

  @ApiProperty({ example: 'Class 6' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  classStudying!: string;

  @ApiProperty({ type: AddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;

  @ApiProperty({ enum: TargetExam, isArray: true, example: [TargetExam.SAINIK] })
  @IsArray()
  @IsEnum(TargetExam, { each: true })
  targetExam!: TargetExam[];

  @ApiPropertyOptional({ example: '2025-04-01' })
  @IsOptional()
  @IsDateString()
  admissionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiPropertyOptional({ example: '9876543210', description: 'Parent phone — auto-links or creates parent record' })
  @IsOptional()
  @IsString()
  parentPhone?: string;

  @ApiPropertyOptional({ example: 'Rajesh Singh' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  parentName?: string;

  @ApiPropertyOptional({ example: 'parent@example.com' })
  @IsOptional()
  @IsString()
  parentEmail?: string;

  @ApiPropertyOptional({ description: 'Aadhar number (will be stored encrypted)' })
  @IsOptional()
  @IsString()
  aadharNumber?: string;
}
