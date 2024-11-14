import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  app.use(cookieParser());
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

  await app.listen(configService.get('APP_PORT'));
}
bootstrap();
