import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { SsoProtocol } from '@prime/shared-types';

export class VerifyMfaDto {
  @IsUUID()
  factorId!: string;

  @IsString()
  code!: string;
}

export class RegisterTrustedDeviceDto {
  @IsString()
  deviceId!: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  platform?: string;
}

export class CreateSsoProviderDto {
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsString()
  name!: string;

  @IsEnum(SsoProtocol)
  protocol!: SsoProtocol;

  @IsString()
  issuerUrl!: string;

  @IsString()
  clientId!: string;

  @IsOptional()
  @IsString()
  clientSecretRef?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class CreateSsoDomainDto {
  @IsUUID()
  providerId!: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsString()
  domain!: string;
}
