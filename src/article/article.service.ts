import { Inject, Injectable } from '@nestjs/common';
import { ArticleInterface } from './article.interface';
import { ArticleCreateRequestDto, ArticleResponse } from './article.model';
import { PrismaService } from '../common/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class ArticleService implements ArticleInterface {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  create(
    request: ArticleCreateRequestDto,
    thumbnailFile: Express.Multer.File,
  ): Promise<ArticleResponse> {
    throw new Error('Method not implemented.');
  }
}
