import { INestApplication } from '@nestjs/common';
import { LabelTestService } from './label-test.service';
import { UserTestService } from './user-test.service';
import { Logger } from 'winston';
import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from './test.module';
import { AppModule } from '../src/app.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { CategoryTestService } from './category-test.service';
import { ArticleTestService } from './article-test.service';
import { ArticleCreateRequestDto } from '../src/article/article.dto';
import { Category, Label } from '@prisma/client';
describe('ArticleController (e2e)', () => {
  let app: INestApplication;
  let labelTestService: LabelTestService;
  let userTestService: UserTestService;
  let categoryTestService: CategoryTestService;
  let articleTestService: ArticleTestService;
  let logger: Logger;
  let token: string;
  let category: Category;
  let Labels: Partial<Label>[];
  const username = 'cibay article';
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userTestService = app.get(UserTestService);
    labelTestService = app.get(LabelTestService);
    categoryTestService = app.get(CategoryTestService);
    articleTestService = app.get(ArticleTestService);
    logger = app.get<Logger>(WINSTON_MODULE_PROVIDER);
    await app.init();
    await userTestService.deleteUser(username);
    const user = await userTestService.createUser(username);
    const response = await request(app.getHttpServer())
      .post('/user/login')
      .send({ username: user.username, password: user.password });

    const accToken = response.body.data.token;
    token = 'Bearer ' + accToken;
  });

  afterAll(async () => {
    await userTestService.deleteUser(username);
  });

  describe('articles (POST)', () => {
    it('should success and return posted article', async () => {});
  });
  describe('articles (GET)', () => {
    it('should success and return articles', async () => {});
  });
  describe('articles/:articleId (GET)', () => {
    it('should success and return article', async () => {});
  });
});
