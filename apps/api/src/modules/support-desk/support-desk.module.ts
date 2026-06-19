import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SupportDeskController } from './support-desk.controller';
import { SupportDeskService } from './support-desk.service';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SupportDeskController, TicketsController],
  providers: [SupportDeskService, TicketsService],
})
export class SupportDeskModule {}
