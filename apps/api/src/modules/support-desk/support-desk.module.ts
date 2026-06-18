import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SupportDeskController } from './support-desk.controller';
import { SupportDeskService } from './support-desk.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SupportDeskController],
  providers: [SupportDeskService],
})
export class SupportDeskModule {}
