import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ApiPlatformModule } from '../api-platform/api-platform.module';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';

@Module({
  imports: [DatabaseModule, ApiPlatformModule],
  controllers: [SecurityController],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
