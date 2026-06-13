import { Module } from '@nestjs/common';
import { OnlineTestsController } from './online-tests.controller';
import { OnlineTestsService } from './online-tests.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [OnlineTestsController],
  providers: [OnlineTestsService],
  exports: [OnlineTestsService],
})
export class OnlineTestsModule {}
