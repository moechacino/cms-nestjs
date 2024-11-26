import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { DataWithPagination, WebResponse } from '../../types/web.type';
import {
  ArticleCreateRequestDto,
  ArticleResponse,
} from '../../../article/article.model';

export const ApiDocsGetAllArticle = () => {
  const docs200: {
    empty: WebResponse<DataWithPagination<ArticleResponse[]>>;
  } = {
    empty: {
      success: true,
      data: [],
      pagination: {
        currentPage: 1,
        totalData: 0,
        totalPage: 1,
      },
    },
  };
  return applyDecorators(
    ApiOperation({ summary: 'Get all articles with pagination.' }),
    ApiQuery({
      name: 'take',
      required: false,
      type: Number,
      description: 'Number of articles to fetch. Default is 16.',
      example: 16,
      default: 16,
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number for pagination. Default is 1.',
      example: 1,
      default: 1,
    }),
    ApiQuery({
      name: 'categoryId',
      required: false,
      type: Number,
      description: 'Filter articles by category ID. Optional.',
      example: 3,
    }),
    ApiQuery({
      name: 'labelsId',
      required: false,
      type: String,
      description:
        'Filter articles by label IDs. Must be a JSON array string, e.g., `[4,5,6]`. Optional.',
      example: '[4,5,6]',
    }),
    ApiQuery({
      name: 'sort',
      required: false,
      type: String,
      enum: ['recent', 'oldest'],
      description: 'Sort articles by "recent" or "oldest". Optional.',
      example: 'recent',
    }),

    ApiResponse({
      status: 200,
      schema: {
        example: docs200.empty,
      },
    }),
  );
};
