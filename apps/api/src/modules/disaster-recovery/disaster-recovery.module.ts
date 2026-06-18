import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { DisasterRecoveryController } from './disaster-recovery.controller';
import { DisasterRecoveryService } from './disaster-recovery.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DisasterRecoveryController],
  providers: [DisasterRecoveryService],
})
export class DisasterRecoveryModule {}
