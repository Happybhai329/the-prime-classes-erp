import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  ExtensionPointType,
  MarketplaceScope,
} from '@prime/shared-types';

export class CreateMarketplaceAppDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  publisher!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  scopes!: string[];

  @IsObject()
  manifest!: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @IsEnum(ExtensionPointType, { each: true })
  extensionPoints?: ExtensionPointType[];
}

export class InstallMarketplaceAppDto {
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsEnum(MarketplaceScope)
  scope!: MarketplaceScope;

  @IsArray()
  @IsString({ each: true })
  permissions!: string[];

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
