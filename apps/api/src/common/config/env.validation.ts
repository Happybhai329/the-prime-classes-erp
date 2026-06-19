import { plainToInstance, Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsOptional, IsBoolean, validateSync } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Staging = 'staging',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number = 3000;

  @IsString()
  API_PREFIX: string = 'api/v1';

  @IsString()
  DATABASE_URL: string;

  @IsString()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_ACCESS_EXPIRY: string = '15m';

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_REFRESH_EXPIRY: string = '7d';

  @IsString()
  MINIO_ENDPOINT: string = 'localhost';

  @IsNumber()
  MINIO_PORT: number = 9000;

  @IsString()
  MINIO_ACCESS_KEY: string;

  @IsString()
  MINIO_SECRET_KEY: string;

  @IsString()
  @IsOptional()
  MINIO_BUCKET?: string = 'prime-erp-files';

  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  @IsOptional()
  MINIO_USE_SSL?: boolean = false;

  // Firebase
  @IsString()
  @IsOptional()
  FIREBASE_PROJECT_ID?: string;

  @IsString()
  @IsOptional()
  FIREBASE_CLIENT_EMAIL?: string;

  @IsString()
  @IsOptional()
  FIREBASE_PRIVATE_KEY?: string;

  // Razorpay
  @IsString()
  @IsOptional()
  RAZORPAY_KEY_ID?: string;

  @IsString()
  @IsOptional()
  RAZORPAY_KEY_SECRET?: string;

  @IsString()
  @IsOptional()
  RAZORPAY_WEBHOOK_SECRET?: string;

  // Email
  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsNumber()
  @IsOptional()
  SMTP_PORT?: number;

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASSWORD?: string;

  @IsString()
  @IsOptional()
  SMTP_FROM?: string;

  // Rate Limiting
  @IsNumber()
  @IsOptional()
  THROTTLE_TTL?: number = 60;

  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT?: number = 100;

  // Observability
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  @IsOptional()
  OTEL_ENABLED?: boolean = false;

  @IsString()
  @IsOptional()
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?: string;

  @IsString()
  @IsOptional()
  GRAFANA_ADMIN_PASSWORD?: string;
}

export function validate(config: Record<string, any>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true }
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    const errorMessages = errors.map(err => {
      const constraints = err.constraints ? Object.values(err.constraints).join(', ') : 'unknown validation error';
      return `${err.property}: ${constraints}`;
    }).join('\n');
    throw new Error(`\n=== CONFIGURATION VALIDATION FAILED ===\n${errorMessages}\n=======================================`);
  }
  return validatedConfig;
}
