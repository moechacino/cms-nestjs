import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import { Article } from '@prisma/client';

@Injectable()
export class ArticleTestService {
  constructor(private readonly prismaService: PrismaService) {}

  async deleteArticles() {
    await this.prismaService.labelOnArticle.deleteMany();
    await this.prismaService.article.deleteMany();
  }

  async createArticle(): Promise<Article> {
    const labels = await this.prismaService.label.create({
      data: {
        name: 'article labell',
      },
    });

    const category = await this.prismaService.category.create({
      data: {
        name: 'article category',
      },
    });
    const article = await this.prismaService.article.create({
      data: {
        content: 'conteng',
        slug: 'slug',
        thumbnailAlt: 'tumbnalat',
        thumbnailFilename: 'filename',
        thumbnailUrl: 'url',
        title: 'title',
        author: ' author',
        categoryId: category.categoryId,
      },
    });

    await this.prismaService.labelOnArticle.create({
      data: {
        articleId: article.articleId,
        labelId: labels.labelId,
      },
    });

    return this.prismaService.article.findUnique({
      where: { articleId: article.articleId },
    });
  }
}
