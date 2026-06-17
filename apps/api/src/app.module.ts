import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

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

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

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
    AdmissionsModule,
    EventsModule,
    CampaignsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');
  }
}
