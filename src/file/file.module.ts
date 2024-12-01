import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from '../common/guard/role/role.guard';
import { FileRepository } from './file.repository';

@Module({
  providers: [
    FileService,
    FileRepository,
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  controllers: [FileController],
})
export class FileModule {}
