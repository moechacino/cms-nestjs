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
  ArticleQueryRequestDto,
  ArticleResponse,
  ArticleUpdateRequestDto,
} from '../src/article/article.model';
import { Category, Label } from '@prisma/client';
import { DataWithPagination, WebResponse } from '../src/common/types/web.type';
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
  const labelsId: number[] = [];
  let createReq: ArticleCreateRequestDto;
  const username = 'cibay article';
  const filePath = 'test/file-test/less1mb.png';
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
    await articleTestService.deleteArticles();
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
    createReq = {
      title: 'mahira agus cantik',
      content: `<h1>Selamat Datang di Contoh HTML Sederhana!</h1> <p>Ini adalah gambar contoh yang dapat diklik.</p> <a href="https://www.example.com" target="_blank"> <img src="https://via.placeholder.com/400" alt="Contoh Gambar"> </a> <p>Klik gambar di atas untuk mengunjungi website.</p>`,
      categoryId: category.categoryId,
      author: 'Writer 1',
      labelsId: labelsId,
    };
  });

  afterAll(async () => {
    await userTestService.deleteUser(username);
    await articleTestService.deleteArticles();
    await categoryTestService.deleteCategories();
    await labelTestService.deleteLabels();
  });

  describe('articles (POST)', () => {
    it('should success and return posted article', async () => {
      const response = await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', token)
        .field('title', createReq.title)
        .field('content', createReq.content)
        .field('categoryId', createReq.categoryId.toString())
        .field('author', createReq.author)
        .field('labelsId', createReq.labelsId)
        .attach('thumbnail', filePath); // Mengirim file thumbnail

      logger.warn(response.body);

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
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });
    it('should success but duplicated article so return copied slug', async () => {
      const response = await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', token)
        .field('title', createReq.title)
        .field('content', createReq.content)
        .field('categoryId', createReq.categoryId.toString())
        .field('author', createReq.author)
        .field('labelsId', createReq.labelsId)
        .attach('thumbnail', filePath) // Mengirim file thumbnail
        .expect(201);

      logger.warn(response.body);

      expect(response.body).toStrictEqual<WebResponse<ArticleResponse>>({
        success: true,
        data: {
          articleId: expect.any(String),
          title: createReq.title,
          content: createReq.content,
          slug: expect.stringMatching(
            new RegExp(`^${generateSlug(createReq.title)}-\\d+$`),
          ),
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

          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });
    it('should success even labelsId just 1', async () => {
      await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', token)
        .field('title', createReq.title)
        .field('content', createReq.content)
        .field('categoryId', createReq.categoryId.toString())
        .field('author', createReq.author)
        .field('labelsId', [labelsId[0]])
        .attach('thumbnail', filePath)
        .expect(201);
    });
    it('should throw bad request, labelsId must be array of number', async () => {
      await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', token)
        .field('title', createReq.title)
        .field('content', createReq.content)
        .field('categoryId', createReq.categoryId.toString())
        .field('author', createReq.author)
        .field('labelsId', [1, 2, 'string'])
        .attach('thumbnail', filePath) // Mengirim file thumbnail
        .expect(400);
    });
    it('should throw bad request, thumbnail must be provided', async () => {
      await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', token)
        .field('title', createReq.title)
        .field('content', createReq.content)
        .field('categoryId', createReq.categoryId.toString())
        .field('author', createReq.author)
        .field('labelsId', [1, 2])
        .expect(400);
    });
  });
  describe('articles (GET)', () => {
    it('should success  and return articles ', async () => {
      await articleTestService.createArticle();
      const query = {
        take: 1,
        page: 1,
      };
      const response = await request(app.getHttpServer())
        .get('/articles')
        .query(query)
        .expect(200);

      logger.warn(response.body);

      expect(response.body).toStrictEqual<
        WebResponse<DataWithPagination<ArticleResponse[]>>
      >({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining<ArticleResponse>({
            articleId: expect.any(String),
            title: expect.any(String),
            content: expect.any(String),
            slug: expect.any(String),
            author: expect.any(String),
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

            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
        pagination: {
          currentPage: 1,
          totalData: expect.any(Number),
          totalPage: expect.any(Number),
        },
      });
    });

    it('should return empty array because categoryId not match', async () => {
      const query = {
        categoryId: 99999,
      };
      const response = await request(app.getHttpServer())
        .get('/articles')
        .query(query)
        .expect(200);

      expect(response.body).toStrictEqual<
        WebResponse<DataWithPagination<ArticleResponse[]>>
      >({
        success: true,
        data: [],
        pagination: {
          currentPage: 1,
          totalData: 0,
          totalPage: 1,
        },
      });
    });
    it('should return empty array because labelsId not match', async () => {
      const query = {
        labelsId: [99999],
      };
      const response = await request(app.getHttpServer())
        .get('/articles')
        .query(query)
        .expect(200);

      expect(response.body).toStrictEqual<
        WebResponse<DataWithPagination<ArticleResponse[]>>
      >({
        success: true,
        data: [],
        pagination: {
          currentPage: 1,
          totalData: 0,
          totalPage: 1,
        },
      });
    });
    it('should throw bad request invalid labelsId query', async () => {
      const query = {
        labelsId: [1, 2, '1fsa'],
      };
      await request(app.getHttpServer())
        .get('/articles')
        .query(query)
        .expect(400);
    });
  });

  describe('articles/:articleId (GET)', () => {
    it('should success and return article', async () => {
      const article = await articleTestService.createArticle('getone');
      const response = await request(app.getHttpServer())
        .get(`/articles/${article.articleId}`)
        .expect(200);

      expect(response.body).toStrictEqual<WebResponse<ArticleResponse>>({
        success: true,
        data: {
          articleId: expect.any(String),
          title: expect.any(String),
          content: expect.any(String),
          slug: expect.any(String),
          author: expect.any(String),
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
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });

    it('should throw bad request', async () => {
      await request(app.getHttpServer()).get(`/articles/715b008b`).expect(400);
    });
    it('should throw not found', async () => {
      await request(app.getHttpServer())
        .get(`/articles/715b008b-e0f5-4b81-b4a3-ba252a397649`)
        .expect(404);
    });
  });

  describe('articles/:articleId (PATCH)', () => {
    const updateReq: ArticleUpdateRequestDto = {
      author: 'new author',
      content: 'updated content',
      title: 'updated title',
    };
    it('should update article with new thumbnail and return updated article', async () => {
      const oldArticle = await articleTestService.createArticle('update');
      const newLabel = (await labelTestService.createLabel('update label'))
        .labelId;
      const newCategory = (
        await categoryTestService.createCategory('update category')
      ).categoryId;
      updateReq.labelsId = [oldArticle.labels[0].labelId, newLabel];
      updateReq.categoryId = newCategory;
      const response = await request(app.getHttpServer())
        .patch(`/articles/${oldArticle.articleId}`)
        .set('Authorization', token)
        .field('title', updateReq.title) // optional
        .field('content', updateReq.content) // optional
        .field('categoryId', updateReq.categoryId) // optional
        .field('author', updateReq.author) // optional
        .field('labelsId', updateReq.labelsId) // optional
        .attach('newThumbnail', filePath); // Mengirim file thumbnail

      logger.warn('update ` body: ', response.body);
      expect(response.body).toStrictEqual<WebResponse<ArticleResponse>>({
        success: true,
        data: {
          articleId: oldArticle.articleId,
          author: updateReq.author,
          title: updateReq.title,
          content: updateReq.content,
          category: {
            categoryId: updateReq.categoryId,
            name: expect.any(String),
          },
          slug: expect.any(String),
          thumbnailAlt: updateReq.title,
          thumbnailFilename: expect.any(String),
          thumbnailUrl: expect.any(String),
          labels: [
            {
              labelId: updateReq.labelsId[0],
              name: expect.any(String),
            },
            {
              labelId: updateReq.labelsId[1],
              name: expect.any(String),
            },
          ],
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });

    it('should update without thumbnail and partial field, return article response', async () => {
      const oldArticle = await articleTestService.createArticle('update kedua');
      const response = await request(app.getHttpServer())
        .patch(`/articles/${oldArticle.articleId}`)
        .set('Authorization', token)
        .field('title', 'updated title')
        .expect(200);
      logger.warn('update 2 body: ', response.body);
      expect(response.body).toStrictEqual<WebResponse<ArticleResponse>>({
        success: true,
        data: {
          articleId: oldArticle.articleId,
          author: oldArticle.author,
          title: 'updated title',
          content: oldArticle.content,
          category: {
            categoryId: oldArticle.categoryId,
            name: expect.any(String),
          },
          slug: expect.not.stringMatching(oldArticle.slug),
          thumbnailAlt: expect.stringContaining('updated title'),
          thumbnailFilename: expect.stringContaining('updated-title'),
          thumbnailUrl: expect.stringContaining('updated-title'),
          labels: [
            {
              labelId: oldArticle.labels[0].label.labelId,
              name: oldArticle.labels[0].label.name,
            },
          ],
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });
  });
});
