import { Global, Module } from '@nestjs/common';
import { MetricsInterceptor } from './metrics.interceptor';
import { ObservabilityController } from './observability.controller';
import { MetricsService } from './metrics.service';

@Global()
@Module({
  controllers: [ObservabilityController],
  providers: [MetricsService, MetricsInterceptor],
  exports: [MetricsService, MetricsInterceptor],
})
export class ObservabilityModule {}
