import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { StorageModule } from '../storage/storage.module';
import { HealthController } from './health.controller';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [HealthController],
})
export class HealthModule {}
