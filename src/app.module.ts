import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { LabelModule } from './label/label.module';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [CommonModule, UserModule, ArticleModule, LabelModule, CategoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
