import { Module } from '@nestjs/common';
import { OrganizationScopeGuard } from '../../common/enterprise';
import { DatabaseModule } from '../../database/database.module';
import { ResourceCenterController } from './resource-center.controller';
import { ResourceCenterService } from './resource-center.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ResourceCenterController],
  providers: [ResourceCenterService, OrganizationScopeGuard],
  exports: [ResourceCenterService],
})
export class ResourceCenterModule {}
