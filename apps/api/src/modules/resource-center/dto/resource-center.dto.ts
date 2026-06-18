import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  ResourceAssetType,
  ResourceVisibility,
} from '@prime/shared-types';

export class CreateResourceItemDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ResourceAssetType)
  assetType!: ResourceAssetType;

  @IsEnum(ResourceVisibility)
  visibility!: ResourceVisibility;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class PublishResourceDto {
  @IsOptional()
  @IsUUID()
  organizationUnitId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsBoolean()
  allowOverride?: boolean;
}

export class CreateSharedAcademicAssetDto {
  @IsEnum(ResourceAssetType)
  assetType!: ResourceAssetType;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsString()
  targetExam?: string;

  @IsObject()
  payload!: Record<string, unknown>;
}
