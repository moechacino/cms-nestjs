import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from '../common/guard/role/role.guard';
import { LabelModule } from '../label/label.module';
import { CategoryModule } from '../category/category.module';
import { ArticleService } from './article.service';

@Module({
  controllers: [ArticleController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    ArticleService,
  ],
  imports: [LabelModule, CategoryModule],
})
export class ArticleModule {}
