import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { OrganizationScopeGuard } from '../../common/enterprise';
import { OrganizationHierarchyController } from './organization-hierarchy.controller';
import { OrganizationHierarchyService } from './organization-hierarchy.service';

@Module({
  imports: [DatabaseModule],
  controllers: [OrganizationHierarchyController],
  providers: [OrganizationHierarchyService, OrganizationScopeGuard],
  exports: [OrganizationHierarchyService],
})
export class OrganizationHierarchyModule {}
