import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, UserRole } from '@prime/shared-types';

export class CreateNotificationDto {
  @ApiProperty({ example: 'New Test Scheduled' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ example: 'A new mock test has been scheduled for June 15.' })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.EXAM_ALERT })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiPropertyOptional({ enum: UserRole, isArray: true, description: 'Target roles (if broadcasting to roles)' })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  targetRoles?: UserRole[];

  @ApiPropertyOptional({ type: [String], description: 'Target user UUIDs (for specific users)' })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  targetIds?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
