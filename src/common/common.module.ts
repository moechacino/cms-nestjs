import {
  BadRequestException,
  Global,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ErrorFilter } from './error.filter';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        stopAtFirstError: true,
        exceptionFactory: (errors) => {
          const result = errors.map((error) => ({
            property: error.property,
            message: error.constraints[Object.keys(error.constraints)[0]],
          }));
          return new BadRequestException(result);
        },
      }),
    },
  ],
  exports: [PrismaService],
  imports: [
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf((info) => {
          if (info.level === 'warn' || info.level === 'error') {
            winston.format.prettyPrint();
            return `${info.timestamp} [${info.level}]: \n ${JSON.stringify(info.message)}`;
          }
          return `${info.timestamp} [${info.level}]: ${JSON.stringify(info.message)}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class CommonModule {}
