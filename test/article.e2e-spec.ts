import { INestApplication } from '@nestjs/common';
import { LabelTestService } from './label-test.service';
import { UserTestService } from './user-test.service';
import { Logger } from 'winston';
import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from './test.module';
import { AppModule } from '../src/app.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
describe('ArticleController (e2e)', () => {
  let app: INestApplication;
  let labelTestService: LabelTestService;
  let userTestService: UserTestService;
  let logger: Logger;
  let token: string;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userTestService = app.get(UserTestService);
    labelTestService = app.get(LabelTestService);
    logger = app.get<Logger>(WINSTON_MODULE_PROVIDER);
    await app.init();

    const user = await userTestService.createUser('cibay article');
    const response = await request(app.getHttpServer())
      .post('/user/login')
      .send({ username: user.username, password: user.password });

    const accToken = response.body.data.token;
    token = 'Bearer ' + accToken;
  });

  afterEach(async () => {
    await labelTestService.deleteLabels();
    await userTestService.deleteUsers();
  });
});
