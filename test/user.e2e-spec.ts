import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UserTestService } from './user-test.service';
import { TestModule } from './test.module';
import { UserLoginRequestDto, UserLoginResponse } from '../src/user/user.dto';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ErrResponse, WebResponse } from '../src/common/types/web.type';
import * as cookieParser from 'cookie-parser';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userTestService: UserTestService;
  let logger: Logger;
  const username = 'cibay user';
  let user: { userId: string; username: string; password: string };
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userTestService = app.get(UserTestService);
    logger = app.get<Logger>(WINSTON_MODULE_PROVIDER);
    app.use(cookieParser());
    await app.init();
    await userTestService.deleteUser(username);
    user = await userTestService.createUser(username);
  });

  afterAll(async () => {
    await userTestService.deleteUser(username);
  });

  describe('/user/login (POST)', () => {
    let loginRequest: UserLoginRequestDto;
    it('should login success', async () => {
      loginRequest = {
        username: user.username,
        password: user.password,
      };

      const response = await request(app.getHttpServer())
        .post('/user/login')
        .send(loginRequest)
        .expect(200);

      expect(response.body).toStrictEqual<WebResponse<UserLoginResponse>>({
        data: {
          token: expect.any(String),
          user: { username: loginRequest.username },
        },
        success: true,
      });
      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(cookies.some((cookie) => cookie.startsWith('admin_rt='))).toBe(
        true,
      );
    });

    it('should bad request', async () => {
      await request(app.getHttpServer())
        .post('/user/login')
        .send({})
        .expect(400);
    });

    it('should wrong username or password', async () => {
      loginRequest = {
        username: user.username,
        password: 'wrong password',
      };

      const response = await request(app.getHttpServer())
        .post('/user/login')
        .send(loginRequest)
        .expect(401);

      expect(response.body).toStrictEqual<ErrResponse>({
        success: false,
        errors: {
          message: 'wrong username or password',
        },
      });
    });
  });

  describe('/user/logout (PATCH)', () => {
    let token: string;
    beforeEach(async () => {
      const user = await userTestService.createUser();
      token = (
        await request(app.getHttpServer())
          .post('/user/login')
          .send({ username: user.username, password: user.password })
      ).body.data.token;
    });
    afterEach(async () => {
      await userTestService.deleteUsers();
    });

    it('should logout success', async () => {
      const response = await request(app.getHttpServer())
        .patch('/user/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toStrictEqual<WebResponse>({
        success: true,
      });
      const cookies = response.headers['set-cookie'] as unknown as string[];

      expect(cookies).toBeDefined();
      expect(cookies.some((cookie) => cookie.startsWith('admin_rt=;'))).toBe(
        true,
      );
    });

    it('should throw unauthorized invalid token', async () => {
      const response = await request(app.getHttpServer())
        .patch('/user/logout')
        .set('Authorization', 'Bearer wrong token')
        .expect(401);
      expect(response.body).toStrictEqual<ErrResponse>({
        success: false,
        errors: {
          message: 'Invalid Token',
        },
      });
    });
    it('should throw unauthorized without token', async () => {
      const response = await request(app.getHttpServer())
        .patch('/user/logout')
        .expect(401);

      expect(response.body).toStrictEqual<ErrResponse>({
        success: false,
        errors: {
          message: 'Unauthorized',
        },
      });
    });
  });

  describe('/user/access-token (GET)', () => {
    let cookie: string[];
    beforeEach(async () => {
      const user = await userTestService.createUser();
      const response = await request(app.getHttpServer())
        .post('/user/login')
        .send({ username: user.username, password: user.password });

      cookie = response.headers['set-cookie'] as unknown as string[];
    });
    afterEach(async () => {
      await userTestService.deleteUsers();
    });

    it('should get new access token', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/access-token')
        .set('Cookie', cookie)
        .withCredentials(true)
        .expect(200);

      expect(response.body).toStrictEqual<WebResponse<{ token: string }>>({
        success: true,
        data: {
          token: expect.any(String),
        },
      });
    });

    it('should invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/access-token')
        .set('Cookie', ['admin_rt=432jslfjdsf8u2jif34'])
        .withCredentials(true)
        .expect(401);

      expect(response.body).toStrictEqual<ErrResponse>({
        success: false,
        errors: {
          message: 'Invalid Token',
        },
      });
    });
  });
});
