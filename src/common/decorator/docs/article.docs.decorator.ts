import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  DataWithPagination,
  ErrResponse,
  WebResponse,
} from '../../types/web.type';
import {
  ArticleCreateRequestDto,
  ArticleResponse,
} from '../../../article/article.model';

export function ApiDocsGetAllArticle() {
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
      examples: {
        withLabels: {
          summary: 'article with labels',
          value: docs200.withLabels,
        },
        withoutLabels: {
          summary: 'article without labels',
          value: docs200.withoutLabels,
        },
        empty: {
          summary: 'empty',
          value: docs200.empty,
        },
      },
    }),
    ApiResponse({
      status: 400,
      examples: {
        labelsIdArr: {
          summary: 'labelsId must be array',
          value: docs400.labelsIdArr,
        },
        labelsIdNumArr: {
          summary: 'labelsId must be array of number',
          value: docs400.labelsIdNumArr,
        },
      },
    }),
  );
}

const docs200: {
  empty: WebResponse<DataWithPagination<ArticleResponse[]>>;
  withLabels: WebResponse<DataWithPagination<ArticleResponse[]>>;
  withoutLabels: WebResponse<DataWithPagination<ArticleResponse[]>>;
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
  withLabels: {
    success: true,
    data: [
      {
        articleId: '7037a54d-b336-4a2c-a14d-275ce637fdcd',
        author: 'John Doe',
        content:
          'Artificial Intelligence is revolutionizing the healthcare industry...',
        slug: 'exploring-ai-in-healthcare',
        title: 'Exploring AI in Healthcare',
        thumbnailUrl:
          'F:/1Project/cms-nestjs/storage/files/thumbnail/eg-thumbnail.jpg',
        thumbnailFilename: 'ai-healthcare-thumbnail.jpg',
        thumbnailAlt: 'AI in healthcare',
        category: {
          categoryId: 270,
          name: 'technology',
        },
        labels: [
          {
            labelId: 341,
            name: 'IoT',
          },
          {
            labelId: 342,
            name: 'Artificial Intelligent',
          },
        ],
        createdAt: new Date('2024-11-27T06:45:18.000Z'),
        updatedAt: new Date('2024-11-27T06:45:18.000Z'),
      },
    ],
    pagination: {
      currentPage: 1,
      totalData: 1,
      totalPage: 1,
    },
  },
  withoutLabels: {
    success: true,
    data: [
      {
        articleId: '262d49ab-2bbb-47c1-9888-306446cd59ce',
        author: 'Alice Brown',
        content:
          'Sustainable energy is crucial for the future of our planet...',
        slug: 'sustainable-energy-solutions',
        title: 'Sustainable Energy Solutions',
        thumbnailUrl:
          'F:/1Project/cms-nestjs/storage/files/thumbnail/eg-thumbnail.jpg',
        thumbnailFilename: 'sustainable-energy-thumbnail.jpg',
        thumbnailAlt: 'Sustainable energy',
        category: {
          categoryId: 271,
          name: 'business',
        },
        labels: [],
        createdAt: new Date('2024-11-27T06:45:18.000Z'),
        updatedAt: new Date('2024-11-27T06:45:18.000Z'),
      },
    ],
    pagination: {
      currentPage: 1,
      totalData: 1,
      totalPage: 1,
    },
  },
};

const docs400: {
  labelsIdArr: ErrResponse;
  labelsIdNumArr;
} = {
  labelsIdArr: {
    success: false,
    errors: {
      message: 'labelsId must be a valid JSON array.',
    },
  },
  labelsIdNumArr: {
    success: false,
    errors: {
      message: 'Invalid label ID: m. Must be a number.',
    },
  },
};
