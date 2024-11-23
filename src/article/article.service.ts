import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ArticleInterface } from './article.interface';
import {
  ArticleCreateRequestDto,
  ArticleQueryRequestDto,
  ArticleResponse,
  ArticleWithCategoriesAndLabels,
} from './article.model';
import { PrismaService } from '../common/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import generateSlug from '../common/utils/generateSlug';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { storageDirectory } from '../common/config/multer.config';
import { toArticleResponse } from './article.mapper';
import { Prisma } from '@prisma/client';
import { DataWithPagination } from '../common/types/web.type';
@Injectable()
export class ArticleService implements ArticleInterface {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {}

  private readonly storageUrl = this.configService.get('STORAGE_URL');

  async create(
    request: ArticleCreateRequestDto,
    thumbnailFile: Express.Multer.File,
  ): Promise<ArticleResponse> {
    const { categoryId, content, labelsId, title } = request;
    const author = request.author || 'anonymous';
    const slug = await this.generateUniqueSlug(title);
    const thumbnailFilename = `thumbnail_${slug}${path.extname(thumbnailFile.originalname)}`;
    const thumbnailUrl = `${this.storageUrl}/${storageDirectory.thumbnail.subPath}/${thumbnailFilename}`;
    const tempPath = thumbnailFile.path;
    const finalPath = path.join(
      storageDirectory.thumbnail.mainPath,
      thumbnailFilename,
    );

    const [existingLabels, countCategories] = await Promise.all([
      this.prismaService.label.findMany({
        where: { labelId: { in: labelsId } },
        select: { labelId: true },
      }),
      this.prismaService.category.count({
        where: { categoryId },
      }),
    ]);

    const existingLabelIds = new Set(
      existingLabels.map((label) => label.labelId),
    );

    for (const labelId of labelsId) {
      if (!existingLabelIds.has(labelId)) {
        throw new NotFoundException(`label ${labelId} not found`);
      }
    }

    if (countCategories === 0) {
      throw new NotFoundException('category not found');
    }

    const transaction: ArticleWithCategoriesAndLabels = await this.prismaService
      .$transaction(async (prisma) => {
        const article = await prisma.article.create({
          data: {
            title,
            content,
            categoryId,
            slug,
            author,
            thumbnailAlt: title,
            thumbnailUrl,
            thumbnailFilename,
          },
          select: { articleId: true },
        });
        // create many to many between article and labels
        await Promise.all([
          fs.promises.rename(tempPath, finalPath),

          prisma.labelOnArticle.createMany({
            data: labelsId.map((labelId) => ({
              articleId: article.articleId,
              labelId,
            })),
          }),
        ]);

        const newesArticle: ArticleWithCategoriesAndLabels =
          await prisma.article.findUnique({
            where: { articleId: article.articleId },
            include: {
              category: true,
              labels: {
                include: {
                  label: true,
                },
              },
            },
          });

        return newesArticle;
      })
      // delete file if transaction failed
      .catch(async (error) => {
        if (fs.existsSync(tempPath)) {
          await this.deleteOldThumbnailFile(tempPath);
        } else if (fs.existsSync(finalPath)) {
          await this.deleteOldThumbnailFile(finalPath);
        }
        this.logger.error(
          `Transaction failed for article creation. Error: ${error.message}`,
        );
        throw error;
      });

    return toArticleResponse(transaction);
  }

  async getAll(
    query: ArticleQueryRequestDto,
  ): Promise<DataWithPagination<ArticleResponse[]>> {
    this.logger.warn(query);
    const skip: number = (query.page - 1) * query.take;
    const whereObject: Prisma.ArticleWhereInput = {
      ...(query.categoryId !== undefined && { categoryId: query.categoryId }),
      ...(query.labelsId.length && {
        labels: { some: { labelId: { in: query.labelsId } } },
      }),
    };

    const orderByInput: Prisma.ArticleOrderByWithAggregationInput = {};

    if (query.sort === 'recent') orderByInput.createdAt = 'desc';
    if (query.sort === 'oldest') orderByInput.createdAt = 'asc';

    const [articles, totalData]: [ArticleWithCategoriesAndLabels[], number] =
      await Promise.all([
        this.prismaService.article.findMany({
          skip,
          take: query.take,
          where: whereObject,
          include: {
            category: true,
            labels: {
              include: {
                label: true,
              },
            },
          },
          orderBy: orderByInput,
        }),
        this.prismaService.article.count({
          where: whereObject,
        }),
      ]);

    let totalPage = Math.ceil(totalData / query.take);
    totalPage = totalPage === 0 ? 1 : totalPage;
    return {
      data: articles.map((article) => toArticleResponse(article)),
      currentPage: query.page,
      totalData,
      totalPage,
    };
  }

  private async generateUniqueSlug(str: string): Promise<string> {
    let slug = generateSlug(str);
    let count = 0;
    while (
      (await this.prismaService.article.count({
        where: {
          slug: slug,
        },
      })) !== 0
    ) {
      count++;
      slug = `${generateSlug(str)}-${count}`;
    }

    return slug;
  }

  private async deleteOldThumbnailFile(path: string) {
    await fs.promises
      .unlink(path)
      .catch(() => [this.logger.error(`failed to delete thumbnail ${path}`)]);
  }
}
