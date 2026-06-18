import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ApiKeyGuard } from './api-key.guard';
import { ApiPlatformController } from './api-platform.controller';
import { WEBHOOK_QUEUE } from './api-platform.constants';
import { ApiPlatformService } from './api-platform.service';
import { ApiRateLimitService } from './api-rate-limit.service';
import { ApiUsageInterceptor } from './api-usage.interceptor';
import { PublicApiController } from './public-api.controller';
import { PublicApiService } from './public-api.service';
import { SecretCipherService } from './secret-cipher.service';
import { WebhookProcessor } from './webhook.processor';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({ name: WEBHOOK_QUEUE }),
  ],
  controllers: [ApiPlatformController, PublicApiController],
  providers: [
    ApiPlatformService,
    PublicApiService,
    ApiKeyGuard,
    ApiRateLimitService,
    ApiUsageInterceptor,
    SecretCipherService,
    WebhookProcessor,
  ],
  exports: [ApiPlatformService, SecretCipherService],
})
export class ApiPlatformModule {}
