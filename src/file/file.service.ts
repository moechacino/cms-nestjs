import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FileServiceInterface } from './file.interface';
import { DataWithPagination } from '../common/types/web.type';
import {
  FileResponse,
  FileQueryRequestDto,
  FileUpdateRequestDto,
  FileDeleteRequestDto,
} from './file.model';
import { FileRepository } from './file.repository';
import { storageDirectory } from '../common/config/multer.config';
import { Prisma } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
@Injectable()
export class FileService implements FileServiceInterface {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  private readonly storageUrl = this.configService.get('STORAGE_URL');
  async uploadMultiple(files: Express.Multer.File[]): Promise<void> {
    if (files.length === 0) throw new BadRequestException('files empty');

    const data: Prisma.FileCreateManyInput[] = [];

    for (const file of files) {
      data.push({
        alt: path.basename(file.originalname),
        extension: path.extname(file.filename),
        filename: file.filename,
        mimetype: file.mimetype,
        url: `${this.storageUrl}/${storageDirectory.files.subPath}/${file.filename}`,
      });
    }

    await this.fileRepo.bulkSave(data);
  }
  async getAll(
    query: FileQueryRequestDto,
  ): Promise<DataWithPagination<FileResponse[]>> {
    const skip = (query.page - 1) * query.take;
    const [files, totalData] = await Promise.all([
      this.fileRepo.find(
        query.take,
        skip,
        { mimetype: query.mimetype },
        query.sort,
      ),
      this.fileRepo.count(query.mimetype),
    ]);

    const totalPage = Math.ceil(totalData / query.take);

    return {
      currentPage: query.page,
      data: files,
      totalData,
      totalPage,
    };
  }

  async getOne(fileId: number): Promise<FileResponse> {
    return await this.fileRepo.findById(fileId);
  }

  async update(
    fileId: number,
    request: FileUpdateRequestDto,
  ): Promise<FileResponse> {
    return await this.fileRepo.update(fileId, { alt: request.alt });
  }

  async deleteMultiple(request: FileDeleteRequestDto): Promise<FileResponse[]> {
    const files = await this.fileRepo.find(
      undefined,
      undefined,
      { fileId: { in: request.fileIds } },
      undefined,
    );
    if (files.length !== request.fileIds.length)
      throw new NotFoundException('some files could not be found');

    const promiseProcess = files.map((file) =>
      fs.promises
        .unlink(`${storageDirectory.files.mainPath}/${file.filename}`)
        .catch(() => {
          this.logger.error(`failed to delete ${file.filename}`);
        }),
    );

    promiseProcess.push(this.fileRepo.bulkDelete(request.fileIds));
    await this.prismaService.$transaction(async () => {
      await Promise.all(promiseProcess);
    });
    return files;
  }
}
