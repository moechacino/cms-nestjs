import { Module } from '@nestjs/common';
import { UserTestService } from './user-test.service';
import { LabelTestService } from './label-test.service';
import { CategoryTestService } from './category-test.service';

@Module({
  providers: [UserTestService, LabelTestService, CategoryTestService],
  exports: [UserTestService, LabelTestService, CategoryTestService],
})
export class TestModule {}
