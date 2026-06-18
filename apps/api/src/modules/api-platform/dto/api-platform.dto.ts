import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateApiClientDto {
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  scopes!: string[];

  @IsInt()
  @Min(1)
  @Max(10000)
  rateLimitPerMinute!: number;
}

export class CreateApiKeyDto {
  @IsArray()
  @IsString({ each: true })
  scopes!: string[];

  @IsOptional()
  @IsString()
  expiresAt?: string;
}

export class CreateWebhookEndpointDto {
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsUrl({ require_tld: false })
  url!: string;

  @IsArray()
  @IsString({ each: true })
  eventTypes!: string[];
}

export class PublishWebhookEventDto {
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsString()
  eventType!: string;

  @IsObject()
  payload!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
