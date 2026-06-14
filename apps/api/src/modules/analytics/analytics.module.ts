import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { PredictionService } from './services/prediction.service';
import { RecommendationService } from './services/recommendation.service';
import { PdfReportService } from './services/pdf-report.service';

@Module({
  controllers: [AnalyticsController],
  providers: [
    PredictionService,
    RecommendationService,
    PdfReportService,
  ],
  exports: [
    PredictionService,
    RecommendationService,
    PdfReportService,
  ],
})
export class AnalyticsModule {}
