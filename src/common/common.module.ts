import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
  imports: [
    WinstonModule.forRoot({
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
  ],
})
export class CommonModule {}
