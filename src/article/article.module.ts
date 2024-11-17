import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ArticleController } from './article.controller';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from '../common/guard/role/role.guard';
import { LabelModule } from '../label/label.module';
import { AuthMiddleware } from '../common/middleware/auth/auth.middleware';
import { CategoryModule } from '../category/category.module';

@Module({
  controllers: [ArticleController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  imports: [LabelModule, CategoryModule],
})
export class ArticleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        {
          path: 'articles/labels',
          method: RequestMethod.GET,
        },
        {
          path: 'articles/labels/:labelId',
          method: RequestMethod.GET,
        },
        {
          path: 'articles/categories',
          method: RequestMethod.GET,
        },
        {
          path: 'articles/categories/:categoryId',
          method: RequestMethod.GET,
        },
      )
      .forRoutes(ArticleController);
  }
}
