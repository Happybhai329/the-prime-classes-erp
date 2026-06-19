import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsUUID,
  IsObject,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { LeadSource, LeadStatus, LeadActivityType } from '@prime/shared-types';

// ── Sanitization Helpers ──────────────────────────────────────

const trimTransform = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

// ── Public Lead (Landing Page) ────────────────────────────────

export class CreatePublicLeadDto {
  @ApiProperty({ example: 'Rahul' })
  @IsString()
  @MinLength(1, { message: 'First name is required' })
  @MaxLength(100)
  @trimTransform()
  firstName!: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString()
  @MinLength(1, { message: 'Last name is required' })
  @MaxLength(100)
  @trimTransform()
  lastName!: string;

  @ApiPropertyOptional({ example: 'rahul@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  @trimTransform()
  email?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Phone must be a valid 10-digit Indian mobile number',
  })
  phone?: string;

  @ApiPropertyOptional({ example: 'Interested in Sainik School prep' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @trimTransform()
  notes?: string;

  @ApiPropertyOptional({ enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;
}

// ── Internal Lead Creation ────────────────────────────────────

export class CreateLeadDto {
  @ApiProperty({ example: 'Rahul' })
  @IsString()
  @MinLength(1, { message: 'First name is required' })
  @MaxLength(100)
  @trimTransform()
  firstName!: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString()
  @MinLength(1, { message: 'Last name is required' })
  @MaxLength(100)
  @trimTransform()
  lastName!: string;

  @ApiPropertyOptional({ example: 'rahul@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  @trimTransform()
  email?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Phone must be a valid 10-digit Indian mobile number',
  })
  phone?: string;

  @ApiPropertyOptional({ enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedCounselorId?: string;

  @ApiPropertyOptional({ example: 'Interested in Sainik School prep' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @trimTransform()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metaData?: Record<string, unknown>;
}

// ── Update Lead ───────────────────────────────────────────────

export class UpdateLeadDto extends PartialType(CreateLeadDto) {}

// ── Lead Activity ─────────────────────────────────────────────

export class LeadActivityDto {
  @ApiProperty({ enum: LeadActivityType })
  @IsEnum(LeadActivityType, { message: 'Invalid activity type' })
  activityType!: LeadActivityType;

  @ApiProperty({ example: 'Called the parent, discussed fee structure' })
  @IsString()
  @MinLength(1, { message: 'Description is required' })
  @MaxLength(2000)
  @trimTransform()
  description!: string;

  @ApiPropertyOptional({ example: '2026-06-25T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
