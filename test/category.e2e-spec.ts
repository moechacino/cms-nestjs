import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestModule } from './test.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { WebResponse } from '../src/common/types/web.type';
import { UserTestService } from './user-test.service';
import {
  CategoryRequestDto,
  CategoryResponse,
} from '../src/category/category.model';
import { CategoryTestService } from './category-test.service';
describe('ArticleController (e2e)', () => {
  let app: INestApplication;
  let userTestService: UserTestService;
  let categoryTestService: CategoryTestService;
  let logger: Logger;
  let token: string;
  const username = 'cibay category';
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userTestService = app.get(UserTestService);
    categoryTestService = app.get(CategoryTestService);
    logger = app.get<Logger>(WINSTON_MODULE_PROVIDER);
    await app.init();

    await userTestService.deleteUser(username);
    await categoryTestService.deleteCategories();
    const user = await userTestService.createUser(username);
    const response = await request(app.getHttpServer())
      .post('/user/login')
      .send({ username: user.username, password: user.password });

    const accToken = response.body.data.token;
    token = 'Bearer ' + accToken;
  });
  afterAll(async () => {
    await userTestService.deleteUser(username);
    await categoryTestService.deleteCategories();
  });

  describe('articles/categories (POST)', () => {
    const createReq: CategoryRequestDto = {
      name: 'health',
    };

    it('should create category', async () => {
      const response = await request(app.getHttpServer())
        .post('/articles/categories')
        .send(createReq)
        .set('Authorization', token)
        .expect(201);

      expect(response.body).toStrictEqual<WebResponse<CategoryResponse>>({
        success: true,
        data: {
          categoryId: expect.any(Number),
          name: expect.any(String),
        },
      });
    });
    it('should create duplicated category', async () => {
      const response = await request(app.getHttpServer())
        .post('/articles/categories')
        .send(createReq)
        .set('Authorization', token)
        .expect(201);

      expect(response.body).toStrictEqual<WebResponse<CategoryResponse>>({
        success: true,
        data: {
          categoryId: expect.any(Number),
          name: expect.stringContaining('copy'),
        },
      });
    });
    it('should create duplicated category (2)', async () => {
      const response = await request(app.getHttpServer())
        .post('/articles/categories')
        .send(createReq)
        .set('Authorization', token)
        .expect(201);

      expect(response.body).toStrictEqual<WebResponse<CategoryResponse>>({
        success: true,
        data: {
          categoryId: expect.any(Number),
          name: expect.stringContaining('copy-copy'),
        },
      });
    });
  });

  describe('articles/categories (GET)', () => {
    it('should get all categories', async () => {
      await categoryTestService.createCategory();
      const response = await request(app.getHttpServer())
        .get('/articles/categories')
        .expect(200);

      expect(response.body).toStrictEqual<WebResponse<CategoryResponse[]>>({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining<CategoryResponse>({
            name: expect.any(String),
            categoryId: expect.any(Number),
          }),
        ]),
      });
    });

    it('should get all but empty', async () => {
      await categoryTestService.deleteCategories();
      const response = await request(app.getHttpServer())
        .get('/articles/categories')
        .expect(200);

      expect(response.body).toStrictEqual<WebResponse<CategoryResponse[]>>({
        success: true,
        data: [],
      });
    });
  });

  describe('articles/categories/:categoryId (GET)', () => {
    it('should get 1 category', async () => {
      const category = await categoryTestService.createCategory();
      const response = await request(app.getHttpServer())
        .get(`/articles/categories/${category.categoryId}`)
        .expect(200);

      expect(response.body).toStrictEqual<WebResponse<CategoryResponse>>({
        success: true,
        data: {
          categoryId: expect.any(Number),
          name: expect.any(String),
        },
      });
    });

    it('should throw not found', async () => {
      await request(app.getHttpServer())
        .get(`/articles/categories/123`)
        .expect(404);
    });

    it('should throw invalid id must be number', async () => {
      await request(app.getHttpServer())
        .get(`/articles/categories/123lkfjdalf`)
        .expect(400);
    });
  });

  describe('articles/categories/:categoryId (PATCH)', () => {
    const updateReq: CategoryRequestDto = {
      name: 'new name',
    };
    it('should success', async () => {
      const category = await categoryTestService.createCategory();
      const response = await request(app.getHttpServer())
        .patch(`/articles/categories/${category.categoryId}`)
        .set('Authorization', token)
        .send(updateReq)
        .expect(200);

      expect(response.body).toStrictEqual<WebResponse<CategoryResponse>>({
        success: true,
        data: {
          categoryId: expect.any(Number),
          name: updateReq.name,
        },
      });
    });
    it('should throw not found', async () => {
      await request(app.getHttpServer())
        .patch(`/articles/categories/12321`)
        .set('Authorization', token)
        .send(updateReq)
        .expect(404);
    });
    it('should throw bad request', async () => {
      await request(app.getHttpServer())
        .patch(`/articles/categories/12321`)
        .set('Authorization', token)
        .send({})
        .expect(400);
    });
  });

  describe('articles/categories/:categoryId (DELETE)', () => {
    it('should delete success', async () => {
      const category = await categoryTestService.createCategory();
      const response = await request(app.getHttpServer())
        .delete(`/articles/categories/${category.categoryId}`)
        .set('Authorization', token)
        .expect(200);

      expect(response.body).toStrictEqual<WebResponse<CategoryResponse>>({
        success: true,
        data: {
          categoryId: expect.any(Number),
          name: expect.any(String),
        },
      });
    });
    it('should throw not found', async () => {
      await request(app.getHttpServer())
        .delete(`/articles/categories/999999999`)
        .set('Authorization', token)
        .expect(404);
    });
  });
});
