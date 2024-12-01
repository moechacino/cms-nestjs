import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

import { getAll, getOne, update } from './article.docs.repository';

export function ApiDocsGetAllArticle() {
  const { docs200, docs400 } = getAll;
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

export function ApiDocsPostArticle() {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBearerAuth('access-token'),
    ApiBody({
      description:
        'Payload for creating an article, including the thumbnail file.',
      schema: {
        type: 'object',
        properties: {
          thumbnail: {
            type: 'string',
            format: 'binary',
            description: 'Thumbnail image for the article',
          },
          title: { type: 'string', example: 'How to Use Swagger with NestJS' },
          content: {
            type: 'string',
            example:
              'This is a detailed article about integrating Swagger with NestJS.',
          },
          categoryId: { type: 'number', example: 1 },
          labelsId: {
            type: 'string',
            example: '"[1,2,3]"',
            description: 'JSON array of number',
          },
          author: {
            type: 'string',
            example: 'author',
          },
        },
        required: ['thumbnail', 'title', 'content', 'categoryId'],
      },
    }),
    ApiResponse({
      status: 400,
      examples: {
        e1: {
          summary: 'invalid file type',
          value: {
            success: false,
            errors: {
              message: 'Invalid file type. Only images jpeg, jpg, and png',
            },
          },
        },
        e2: {
          summary: 'labels id',
          value: {
            success: false,
            errors: {
              message: 'label id must be number or array of number',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      examples: {
        ex1: {
          summary: 'without labels',
          value: {
            success: true,
            data: {
              articleId: '69b11eca-0781-40ae-9b58-f8ba8826383b',
              author: 'anonymous',
              content: 'string',
              slug: 'string',
              title: 'string',
              thumbnailUrl:
                'F:/1Project/cms-nestjs/storage/files/thumbnail/thumbnail_string.jpeg',
              thumbnailFilename: 'thumbnail_string.jpeg',
              thumbnailAlt: 'string',
              category: {
                categoryId: 2,
                name: 'business',
              },
              labels: [],
              createdAt: '2024-11-27T13:57:32.000Z',
              updatedAt: '2024-11-27T13:57:32.000Z',
            },
          },
        },
        ex2: {
          summary: 'with labels',
          value: {
            success: true,
            data: {
              articleId: '9d81a086-6819-4366-b093-cfb427d82af7',
              author: 'anonymous',
              content: 'string',
              slug: 'string-1',
              title: 'string',
              thumbnailUrl:
                'F:/1Project/cms-nestjs/storage/files/thumbnail/thumbnail_string-1.jpeg',
              thumbnailFilename: 'thumbnail_string-1.jpeg',
              thumbnailAlt: 'string',
              category: {
                categoryId: 2,
                name: 'business',
              },
              labels: [
                {
                  labelId: 1,
                  name: 'IoT',
                },
              ],
              createdAt: '2024-11-27T14:01:38.000Z',
              updatedAt: '2024-11-27T14:01:38.000Z',
            },
          },
        },
      },
    }),
  );
}

export function ApiDocsGetOneArticle() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      example: getOne.docs200,
    }),
    ApiResponse({
      status: 404,
      example: {
        success: false,
        errors: {
          message: 'Record not found',
        },
      },
    }),
    ApiResponse({
      status: 400,
      example: {
        success: false,
        errors: {
          message: 'Validation failed (uuid is expected)',
        },
      },
    }),
  );
}

export function ApiDocsGetLabelsByArticle() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      examples: {
        ex1: {
          summary: 'ok',
          value: {
            success: true,
            data: [
              {
                labelId: 1,
                name: 'IoT',
              },
              {
                labelId: 3,
                name: 'Artificial Intelligent',
              },
            ],
          },
        },
        ex2: {
          summary: 'empty',
          value: {
            success: true,
            data: [],
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      example: {
        success: false,
        errors: {
          message: 'Validation failed (uuid is expected)',
        },
      },
    }),
  );
}

export function ApiDocsDeleteArticle() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiResponse({
      status: 200,
      example: {
        success: true,
        data: {
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
            categoryId: 1,
            name: 'business',
          },
          labels: [],
          createdAt: '2024-11-30T13:23:24.000Z',
          updatedAt: '2024-11-30T13:23:24.000Z',
        },
      },
    }),
    ApiResponse({
      status: 404,
      example: {
        success: false,
        errors: {
          message: 'Record not found',
        },
      },
    }),
  );
}

export function ApiDocsUpdateArticle() {
  return applyDecorators(
    ApiOperation({ summary: 'Update partial information' }),
    ApiBearerAuth('access-token'),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      required: false,
      description:
        'Payload for creating an article, including the thumbnail file.',
      schema: {
        type: 'object',
        properties: {
          newThumbnail: {
            type: 'string',
            format: 'binary',
            description: 'Thumbnail image for the article',
          },
          title: { type: 'string', example: 'How to Use Swagger with NestJS' },
          content: {
            type: 'string',
            example:
              'This is a detailed article about integrating Swagger with NestJS.',
          },
          categoryId: { type: 'number', example: 1 },
          labelsId: {
            type: 'string',
            example: '"[1,2,3]"',
            description: 'JSON array of number',
          },
          author: {
            type: 'string',
            example: 'author',
          },
        },
        required: [],
      },
    }),
    ApiResponse({
      status: 200,
      example: update.docs200,
    }),
    ApiResponse({
      status: 400,
      example: update.docs400.labelsId,
    }),
    ApiResponse({
      status: 404,
      example: update.docs404,
    }),
  );
}
