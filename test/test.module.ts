import { Module } from '@nestjs/common';
import { UserTestService } from './user-test.service';
import { LabelTestService } from './label-test.service';
import { CategoryTestService } from './category-test.service';
import { ArticleTestService } from './article-test.service';

@Module({
  providers: [
    UserTestService,
    LabelTestService,
    CategoryTestService,
    ArticleTestService,
  ],
  exports: [
    UserTestService,
    LabelTestService,
    CategoryTestService,
    ArticleTestService,
  ],
})
export class TestModule {}
