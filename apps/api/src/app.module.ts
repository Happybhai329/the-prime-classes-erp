import { MiddlewareConsumer, Module, NestModule, Injectable, ExecutionContext } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.SKIP_THROTTLE === 'true') {
      return true;
    }
    return super.canActivate(context);
  }
}


// Core modules
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { StudentsModule } from './modules/students/students.module';
import { ParentsModule } from './modules/parents/parents.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { BatchesModule } from './modules/batches/batches.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { TestsModule } from './modules/tests/tests.module';
import { FeesModule } from './modules/fees/fees.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';

// Phase 5 Modules
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { OnlineTestsModule } from './modules/online-tests/online-tests.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { VideosModule } from './modules/videos/videos.module';
import { CalendarEventsModule } from './modules/calendar-events/calendar-events.module';

// Phase 3 Modules
import { StorageModule } from './modules/storage/storage.module';
import { NoticesModule } from './modules/notices/notices.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { FranchiseModule } from './modules/franchise/franchise.module';

// Phase 9 Modules
import { WebsiteModule } from './modules/website/website.module';
import { CrmModule } from './modules/crm/crm.module';
import { AdmissionsModule } from './modules/admissions/admissions.module';
import { EventsModule } from './modules/events/events.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { SalesModule } from './modules/sales/sales.module';

// Phase 10 Modules
import { OrganizationHierarchyModule } from './modules/organization-hierarchy/organization-hierarchy.module';
import { EnterpriseModule } from './modules/enterprise/enterprise.module';
import { FranchiseBillingModule } from './modules/franchise-billing/franchise-billing.module';
import { PartnerPortalModule } from './modules/partner-portal/partner-portal.module';
import { ResourceCenterModule } from './modules/resource-center/resource-center.module';
import { ApiPlatformModule } from './modules/api-platform/api-platform.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { SecurityModule } from './modules/security/security.module';
import { ObservabilityModule } from './modules/observability/observability.module';
import { MetricsInterceptor } from './modules/observability/metrics.interceptor';
import { DisasterRecoveryModule } from './modules/disaster-recovery/disaster-recovery.module';
import { SupportDeskModule } from './modules/support-desk/support-desk.module';

import { validate } from './common/config/env.validation';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validate,
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const skip = config.get('SKIP_THROTTLE') === 'true' || 
                     config.get('SKIP_THROTTLE') === true || 
                     process.env.SKIP_THROTTLE === 'true';
        console.log('SKIP_THROTTLE Config:', config.get('SKIP_THROTTLE'), typeof config.get('SKIP_THROTTLE'));
        console.log('SKIP_THROTTLE Env:', process.env.SKIP_THROTTLE, typeof process.env.SKIP_THROTTLE);
        console.log('SKIP_THROTTLE resolved:', skip);
        return {
          throttlers: [
            {
              name: 'short',
              ttl: 1000,
              limit: skip ? 100000 : 10,
            },
            {
              name: 'medium',
              ttl: 10000,
              limit: skip ? 500000 : 50,
            },
            {
              name: 'long',
              ttl: 60000,
              limit: skip ? 1000000 : config.get<number>('THROTTLE_LIMIT', 100),
            },
          ],
        };
      },
    }),

    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),

    // Core
    DatabaseModule,

    // Feature modules
    AuthModule,
    UsersModule,
    TenantsModule,
    StudentsModule,
    ParentsModule,
    FacultyModule,
    BatchesModule,
    SubjectsModule,
    AttendanceModule,
    TestsModule,
    FeesModule,
    MaterialsModule,
    NotificationsModule,
    ReportsModule,
    AuditModule,
    DashboardModule,
    HealthModule,
    
// Phase 5 Modules
    AssignmentsModule,
    QuestionsModule,
    OnlineTestsModule,
    AchievementsModule,
    VideosModule,
    
    // Phase 17 Modules
    CalendarEventsModule,
    
    // Phase 3 Feature modules
    StorageModule,
    NoticesModule,
    AnnouncementsModule,
    DocumentsModule,
    CommunicationModule,
    AnalyticsModule,
    SuperAdminModule,
    OnboardingModule,
    FranchiseModule,

    // Phase 9 Modules
    WebsiteModule,
    CrmModule,
    EventsModule,
    CampaignsModule,
    SalesModule,

    // Phase 10
    ObservabilityModule,
    OrganizationHierarchyModule,
    EnterpriseModule,
    FranchiseBillingModule,
    PartnerPortalModule,
    ResourceCenterModule,
    ApiPlatformModule,
    MarketplaceModule,
    SecurityModule,
    DisasterRecoveryModule,
    SupportDeskModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityHeadersMiddleware, RequestContextMiddleware, TenantMiddleware)
      .forRoutes('*');
  }
}
