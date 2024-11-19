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
import {
  ArticleCreateRequestDto,
  ArticleResponse,
} from '../src/article/article.model';
import { Category, Label } from '@prisma/client';
import { WebResponse } from '../src/common/types/web.type';
import generateSlug from '../src/common/utils/generateSlug';
describe('ArticleController (e2e)', () => {
  let app: INestApplication;
  let labelTestService: LabelTestService;
  let userTestService: UserTestService;
  let categoryTestService: CategoryTestService;
  let articleTestService: ArticleTestService;
  let logger: Logger;
  let token: string;
  let category: Category;
  let labelsId: number[];
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
    await categoryTestService.deleteCategories();
    await labelTestService.deleteLabels();
    const user = await userTestService.createUser(username);
    const response = await request(app.getHttpServer())
      .post('/user/login')
      .send({ username: user.username, password: user.password });

    category = await categoryTestService.createCategory('health');
    labelsId.push((await labelTestService.createLabel('label 1')).labelId);
    labelsId.push((await labelTestService.createLabel('label 2')).labelId);
    const accToken = response.body.data.token;
    token = 'Bearer ' + accToken;
  });

  afterAll(async () => {
    await userTestService.deleteUser(username);
    await categoryTestService.deleteCategories();
    await labelTestService.deleteLabels();
  });

  describe('articles (POST)', () => {
    const createReq: ArticleCreateRequestDto = {
      title: 'article 1',
      content: `<h1>Selamat Datang di Contoh HTML Sederhana!</h1> <p>Ini adalah gambar contoh yang dapat diklik.</p> <a href="https://www.example.com" target="_blank"> <img src="https://via.placeholder.com/400" alt="Contoh Gambar"> </a> <p>Klik gambar di atas untuk mengunjungi website.</p>`,
      categoryId: category.categoryId,
      author: 'Writer 1',
      labelsId: labelsId,
    };
    it('should success and return posted article', async () => {
      const filePath = '/test/file-test/less1mb.png';
      const response = await request(app.getHttpServer())
        .post('articles')
        .set('Authorization', token)
        .field('title', createReq.title)
        .field('content', createReq.content)
        .field('categoryId', createReq.categoryId.toString())
        .field('author', createReq.author)
        .field('labelsId', createReq.labelsId.join(','))
        .attach('thumbnail', filePath) // Mengirim file thumbnail
        .expect(201);

      expect(response.body).toStrictEqual<WebResponse<ArticleResponse>>({
        success: true,
        data: {
          articleId: expect.any(String),
          title: createReq.title,
          content: createReq.content,
          slug: generateSlug(createReq.title),
          author: createReq.author,
          labels: expect.arrayContaining([
            expect.objectContaining({
              labelId: expect.any(Number),
              name: expect.any(String),
            }),
          ]),
          thumbnailUrl: expect.any(String),
          thumbnailFilename: expect.any(String),
          thumbnailAlt: expect.any(String),
          category: expect.objectContaining({
            categoryId: expect.any(Number),
            name: expect.any(String),
          }),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });
  });
  describe('articles (GET)', () => {
    it('should success and return articles', async () => {});
  });
  describe('articles/:articleId (GET)', () => {
    it('should success and return article', async () => {});
  });
});
