import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ArticleInterface } from './article.interface';
import {
  ArticleCreateRequestDto,
  ArticleQueryRequestDto,
  ArticleResponse,
  ArticleUpdateRequestDto,
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
import { Article, Prisma } from '@prisma/client';
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

        return await prisma.article.findUnique({
          where: { articleId: article.articleId },
          include: {
            category: {
              select: {
                categoryId: true,
                name: true,
              },
            },
            labels: {
              include: {
                label: {
                  select: {
                    labelId: true,
                    name: true,
                  },
                },
              },
            },
          },
        });
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
            category: {
              select: {
                categoryId: true,
                name: true,
              },
            },
            labels: {
              include: {
                label: {
                  select: {
                    labelId: true,
                    name: true,
                  },
                },
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

  async getById(articleId: string): Promise<ArticleResponse> {
    const article = await this.prismaService.article.findUniqueOrThrow({
      where: { articleId },
      include: {
        category: {
          select: {
            categoryId: true,
            name: true,
          },
        },
        labels: {
          include: {
            label: {
              select: {
                labelId: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return toArticleResponse(article);
  }

  async update(
    articleId: string,
    request: ArticleUpdateRequestDto,
    newThumbnailFile: Express.Multer.File | undefined,
  ): Promise<ArticleResponse> {
    const oldArticle = await this.prismaService.article.findUniqueOrThrow({
      where: { articleId },
      include: {
        category: {
          select: {
            categoryId: true,
            name: true,
          },
        },
        labels: {
          include: {
            label: {
              select: {
                labelId: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const updateData: Prisma.ArticleUpdateInput =
      await this.buildUpdateData(request);

    const updatedArticle = await this.prismaService.$transaction(
      async (prisma) => {
        await this.handleThumbnailUpdate(
          newThumbnailFile || undefined,
          oldArticle,
          request.title || undefined,
          updateData,
        );

        if (request.labelsId && request.labelsId.length > 0) {
          await this.updateArticleLabels(
            prisma,
            articleId,
            request.labelsId,
            oldArticle,
          );
        }

        return prisma.article.update({
          data: updateData,
          where: { articleId },
          include: {
            category: {
              select: { categoryId: true, name: true },
            },
            labels: {
              include: { label: { select: { labelId: true, name: true } } },
            },
          },
        });
      },
    );

    return toArticleResponse(updatedArticle);
  }

  private async buildUpdateData(
    request: ArticleUpdateRequestDto,
  ): Promise<Prisma.ArticleUpdateInput> {
    const updateData: Prisma.ArticleUpdateInput = {
      ...(request.author && { author: request.author }),
      ...(request.content && { content: request.content }),
    };

    if (request.title) {
      const slug = await this.generateUniqueSlug(request.title);
      updateData.slug = slug;
      updateData.title = request.title;
      updateData.thumbnailAlt = request.title;
    }

    if (request.categoryId) {
      // check is category exist
      await this.prismaService.category
        .findUniqueOrThrow({
          where: { categoryId: request.categoryId },
        })
        .catch(() => {
          throw new BadRequestException(
            `Category with ID ${request.categoryId} does not exist.`,
          );
        });

      updateData.category = { connect: { categoryId: request.categoryId } };
    }

    return updateData;
  }

  private async handleThumbnailUpdate(
    newThumbnailFile: Express.Multer.File | undefined,
    oldArticle: Article,
    newTitle: string | undefined,
    updateData: Prisma.ArticleUpdateInput,
  ) {
    const slug = newTitle
      ? await this.generateUniqueSlug(newTitle)
      : oldArticle.slug;

    let newFilename: string | undefined;
    let newThumbnailUrl: string | undefined;

    // handle extension change
    if (newTitle && !newThumbnailFile) {
      const oldExt = path.extname(oldArticle.thumbnailFilename || '');
      newFilename = `thumbnail_${slug}${oldExt}`;
      newThumbnailUrl = `${this.storageUrl}/${storageDirectory.thumbnail.subPath}/${newFilename}`;
    }
    // handle only title change so filename changed without extension
    else if (!newTitle && newThumbnailFile) {
      const oldFilenameWithoutExt = path.basename(
        oldArticle.thumbnailFilename || '',
        path.extname(oldArticle.thumbnailFilename || ''),
      );
      const newExt = path.extname(newThumbnailFile.originalname);
      newFilename = `${oldFilenameWithoutExt}${newExt}`;
      newThumbnailUrl = `${this.storageUrl}/${storageDirectory.thumbnail.subPath}/${newFilename}`;
    }
    // handle if both title and thumbnail change so filename and extension possible to change
    else if (newTitle && newThumbnailFile) {
      const newExt = path.extname(newThumbnailFile.originalname);
      newFilename = `thumbnail_${slug}${newExt}`;
      newThumbnailUrl = `${this.storageUrl}/${storageDirectory.thumbnail.subPath}/${newFilename}`;
    }

    if (newFilename && newThumbnailUrl) {
      updateData.thumbnailFilename = newFilename;
      updateData.thumbnailUrl = newThumbnailUrl;
      if (newThumbnailFile) {
        const finalPath = path.join(
          storageDirectory.thumbnail.mainPath,
          newFilename,
        );
        await fs.promises
          .rename(newThumbnailFile.path, finalPath)
          .catch(async () => {
            if (fs.existsSync(newThumbnailFile.path)) {
              await this.deleteOldThumbnailFile(newThumbnailFile.path);
            }
            this.logger.error(`Failed to rename or write file: ${finalPath}`);
            throw new InternalServerErrorException(
              'Failed to update thumbnail',
            );
          });
      }
    }
  }

  private async updateArticleLabels(
    prisma: Prisma.TransactionClient,
    articleId: string,
    labelsId: number[],
    oldArticle: ArticleWithCategoriesAndLabels,
  ) {
    const existingLabels = await prisma.label.findMany({
      where: { labelId: { in: labelsId } },
      select: { labelId: true },
    });

    const existingLabelIds = existingLabels.map((label) => label.labelId);
    const missingLabels = labelsId.filter(
      (id) => !existingLabelIds.includes(id),
    );

    if (missingLabels.length > 0) {
      throw new NotFoundException(
        `Labels not found: ${missingLabels.join(', ')}`,
      );
    }

    const oldLabelIdList = oldArticle.labels.map((label) => label.labelId);
    const newLabelIdList = labelsId.filter(
      (labelId) => !oldLabelIdList.includes(labelId),
    );

    await prisma.labelOnArticle.deleteMany({
      where: { articleId, labelId: { notIn: labelsId } },
    });

    if (newLabelIdList.length > 0) {
      await prisma.labelOnArticle.createMany({
        data: newLabelIdList.map((labelId) => ({ articleId, labelId })),
      });
    }
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
