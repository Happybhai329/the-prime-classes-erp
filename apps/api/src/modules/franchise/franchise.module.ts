import { Module } from '@nestjs/common';
import { FranchiseController } from './franchise.controller';
import { FranchiseService } from './franchise.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [FranchiseController],
  providers: [FranchiseService],
  exports: [FranchiseService],
})
export class FranchiseModule {}
