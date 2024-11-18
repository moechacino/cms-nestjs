import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestModule } from './test.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { LabelTestService } from './label-test.service';
import {
  LabelCreateRequestDto,
  LabelResponse,
  LabelUpdateRequestDto,
} from '../src/label/label.dto';
import { WebResponse } from '../src/common/types/web.type';
import { UserTestService } from './user-test.service';

describe('ArticleController (e2e)', () => {
  let app: INestApplication;
  let labelTestService: LabelTestService;
  let userTestService: UserTestService;
  let logger: Logger;
  let token: string;
  const username = 'cibay label';
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userTestService = app.get(UserTestService);
    labelTestService = app.get(LabelTestService);
    logger = app.get<Logger>(WINSTON_MODULE_PROVIDER);
    await app.init();
    await userTestService.deleteUser(username);
    await labelTestService.deleteLabels();
    const user = await userTestService.createUser(username);
    const response = await request(app.getHttpServer())
      .post('/user/login')
      .send({ username: user.username, password: user.password });

    const accToken = response.body.data.token;
    token = 'Bearer ' + accToken;
  });

  afterAll(async () => {
    await userTestService.deleteUser(username);
    await labelTestService.deleteLabels();
  });

  describe('articles/labels (POST)', () => {
    const createRequest: LabelCreateRequestDto = {
      labelName: 'new label',
    };

    it('should create label', async () => {
      const response = await request(app.getHttpServer())
        .post('/articles/labels')
        .send(createRequest)
        .set('Authorization', token)
        .expect(201);

      expect(response.body).toStrictEqual<WebResponse<LabelResponse>>({
        success: true,
        data: {
          labelId: expect.any(Number),
          name: expect.any(String),
        },
      });
    });

    it('should bad request', async () => {
      await request(app.getHttpServer())
        .post('/articles/labels')
        .send({})
        .set('Authorization', token)
        .expect(400);
    });

    it('should create label-COPY', async () => {
      const response = await request(app.getHttpServer())
        .post('/articles/labels')
        .send(createRequest)
        .set('Authorization', token)
        .expect(201);
      expect(response.body).toStrictEqual<WebResponse<LabelResponse>>({
        success: true,
        data: {
          labelId: expect.any(Number),
          name: expect.stringContaining('copy'),
        },
      });
    });
  });

  describe('articles/labels (GET)', () => {
    it('should get all label', async () => {
      await labelTestService.createLabel();
      const response = await request(app.getHttpServer())
        .get(`/articles/labels`)
        .expect(200);
      logger.warn(response.body.data);
      expect(response.body).toStrictEqual<WebResponse<LabelResponse[]>>({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining<LabelResponse>({
            labelId: expect.any(Number),
            name: expect.any(String),
          }),
        ]),
      });
    });
  });

  describe('/articles/labels/{id} (GET)', () => {
    it('should get label by id', async () => {
      const label = await labelTestService.createLabel();

      const response = await request(app.getHttpServer())
        .get(`/articles/labels/${label.labelId}`)
        .expect(200);
      expect(response.body).toStrictEqual<WebResponse<LabelResponse>>({
        success: true,
        data: {
          labelId: expect.any(Number),
          name: expect.any(String),
        },
      });

      await labelTestService.deleteLabels();
    });

    it('should throw not found error', async () => {
      await request(app.getHttpServer()).get(`/articles/labels/2`).expect(404);
    });
  });

  describe('/articles/labels/{id} (PATCH)', () => {
    let label: { labelId: number; name: string };
    beforeEach(async () => {
      label = await labelTestService.createLabel();
    });
    afterEach(async () => {
      await labelTestService.deleteLabels();
    });

    it('should update success', async () => {
      const updateReq: LabelUpdateRequestDto = {
        labelName: `updated ${label.name}`,
      };
      const response = await request(app.getHttpServer())
        .patch(`/articles/labels/${label.labelId}`)
        .send(updateReq)
        .set('Authorization', token)
        .expect(200);
      logger.debug(response.body);
      expect(response.body).toStrictEqual<WebResponse<LabelResponse>>({
        success: true,
        data: {
          labelId: expect.any(Number),
          name: expect.any(String),
        },
      });
    });

    it('should throw not found', async () => {
      const updateReq: LabelUpdateRequestDto = {
        labelName: `updated ${label.name}`,
      };
      await request(app.getHttpServer())
        .patch(`/articles/labels/999999`)
        .send(updateReq)
        .set('Authorization', token)
        .expect(404);
    });

    it('should throw bad request', async () => {
      await request(app.getHttpServer())
        .patch(`/articles/labels/${label.labelId}`)
        .send({})
        .set('Authorization', token)
        .expect(400);
    });
  });
  describe('/articles/labels/{id} (DELETE)', () => {
    it('should delete success and return deleted label ', async () => {
      const label = await labelTestService.createLabel();

      const response = await request(app.getHttpServer())
        .delete(`/articles/labels/${label.labelId}`)
        .set('Authorization', token)
        .expect(200);

      expect(response.body).toStrictEqual<WebResponse<LabelResponse>>({
        success: true,
        data: {
          labelId: expect.any(Number),
          name: expect.any(String),
        },
      });
    });

    it('should throw not found error', async () => {
      await request(app.getHttpServer())
        .delete(`/articles/labels/8123`)
        .set('Authorization', token)
        .expect(404);
    });

    it('should throw bad request bad params', async () => {
      await request(app.getHttpServer())
        .delete(`/articles/labels/superid`)
        .set('Authorization', token)
        .expect(400);
    });
  });
});
