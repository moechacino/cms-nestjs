import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  app.use(cookieParser());
  app.use(helmet());
  const whitelists = configService.get<string>('WHITELIST_ORIGIN').split(',');
  app.enableCors({
    origin: function (origin, cb) {
      if (whitelists.indexOf(origin) !== -1 || !origin) {
        cb(null, true);
      } else {
        cb(new ForbiddenException('Not Allowed by CORS'));
      }
    },
    credentials: true,
  });

  // api docs
  const config = new DocumentBuilder()
    .setTitle('Simple CMS for Article')
    .setDescription(
      "Just simple content management system like wordpress. !NOTE :For all endpoints that require authorization, ensure to include {credentials: 'include'} in the requests. If credentials is not included, you will get 401 error",
    )
    .setExternalDoc(
      'for AXIOS users : You must set {  withCredentials: true } ',
      'https://axios-http.com/docs/req_config',
    )
    .setVersion('1.0')
    .setContact(
      'moechacino',
      'https://www.github.com/moechacino',
      'lanaksa28@gmail.com',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'token',
    )
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      autoTagControllers: false,
    });
  SwaggerModule.setup('/', app, documentFactory, {
    jsonDocumentUrl: 'docs/json',
    swaggerOptions: {
      withCredentials: true,
    },
  });

  await app.listen(configService.get('APP_PORT'));
}
bootstrap();
