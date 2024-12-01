import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { File, Prisma } from '@prisma/client';
import { FileQueryRequestDto, FileSortType } from './file.model';

@Injectable()
export class FileRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async bulkSave(data: Prisma.FileCreateManyInput[]): Promise<void> {
    await this.prismaService.file.createMany({
      data,
    });
  }

  async findById(fileId: number): Promise<File> {
    return await this.prismaService.file
      .findUniqueOrThrow({
        where: {
          fileId,
        },
      })
      .catch(() => {
        throw new NotFoundException(`file ${fileId} not found`);
      });
  }

  async bulkDelete(fileIds: number[]): Promise<void> {
    await this.prismaService.file.deleteMany({
      where: {
        fileId: { in: fileIds },
      },
    });
  }

  async find(
    take: number | undefined,
    skip: number | undefined,
    where: Prisma.FileWhereInput,
    sort: FileSortType | undefined,
  ): Promise<File[]> {
    const findManyArgs: Prisma.FileFindManyArgs = {
      ...(take !== undefined && { take }),
      ...(skip !== undefined && { skip }),
      where,
    };
    if (sort === 'oldest') {
      findManyArgs.orderBy = { createdAt: 'asc' };
    }
    if (sort === 'recent') {
      findManyArgs.orderBy = { createdAt: 'desc' };
    }
    return await this.prismaService.file.findMany(findManyArgs);
  }

  async count(mimetype: string | undefined): Promise<number> {
    return await this.prismaService.file.count({
      where: {
        ...(mimetype !== undefined && { mimetype }),
      },
    });
  }

  async update(fileId: number, data: Prisma.FileUpdateInput): Promise<File> {
    return await this.prismaService.file
      .update({
        where: { fileId },
        data,
      })
      .catch(() => {
        throw new NotFoundException(`file ${fileId} not found`);
      });
  }
}
