import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  OrganizationScopeType,
  OrganizationUnitType,
} from '@prime/shared-types';

export class CreateOrganizationUnitDto {
  @IsUUID()
  organizationId!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsEnum(OrganizationUnitType)
  type!: OrganizationUnitType;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsObject()
  address?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  geo?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateOrganizationUnitDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class AssignOrganizationScopeDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  organizationId!: string;

  @IsOptional()
  @IsUUID()
  organizationUnitId?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsEnum(OrganizationScopeType)
  scopeType!: OrganizationScopeType;

  @IsArray()
  @IsString({ each: true })
  permissions!: string[];
}
