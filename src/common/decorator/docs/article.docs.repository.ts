import { ArticleResponse } from '../../../article/article.model';
import {
  DataWithPagination,
  ErrResponse,
  WebResponse,
} from '../../types/web.type';

export const getAll: {
  docs200: {
    empty: WebResponse<DataWithPagination<ArticleResponse[]>>;
    withLabels: WebResponse<DataWithPagination<ArticleResponse[]>>;
    withoutLabels: WebResponse<DataWithPagination<ArticleResponse[]>>;
  };
  docs400: {
    labelsIdArr: ErrResponse;
    labelsIdNumArr: ErrResponse;
  };
} = {
  docs200: {
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
  },
  docs400: {
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
  },
};

export const getOne: {
  docs200: WebResponse<ArticleResponse>;
} = {
  docs200: {
    success: true,
    data: {
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
        categoryId: 2,
        name: 'technology',
      },
      labels: [
        {
          labelId: 1,
          name: 'IoT',
        },
        {
          labelId: 3,
          name: 'Artificial Intelligent',
        },
      ],
      createdAt: '2024-11-30T13:23:24.000Z' as unknown as Date,
      updatedAt: '2024-11-30T13:23:24.000Z' as unknown as Date,
    },
  },
};

export const update = {
  docs200: {
    success: true,
    data: {
      articleId: '7037a54d-b336-4a2c-a14d-275ce637fdcd',
      author: 'author',
      content:
        'This is a detailed article about integrating Swagger with NestJS.',
      slug: 'how-to-use-swagger-with-nestjs',
      title: 'How to Use Swagger with NestJS',
      thumbnailUrl:
        'F:/1Project/cms-nestjs/storage/files/thumbnail/thumbnail_how-to-use-swagger-with-nestjs.jpg',
      thumbnailFilename: 'thumbnail_how-to-use-swagger-with-nestjs.jpg',
      thumbnailAlt: 'How to Use Swagger with NestJS',
      category: {
        categoryId: 2,
        name: 'technology',
      },
      labels: [
        {
          labelId: 1,
          name: 'IoT',
        },
        {
          labelId: 2,
          name: 'Blockchain',
        },
        {
          labelId: 3,
          name: 'Artificial Intelligent',
        },
      ],
      createdAt: '2024-11-30T13:23:24.000Z',
      updatedAt: '2024-12-01T05:44:08.000Z',
    },
  },
  docs404: {
    success: false,
    errors: {
      message: 'Record not found',
    },
  },
  docs400: {
    labelsId: {
      success: false,
      errors: {
        message: 'labelsId must be a valid JSON array.',
      },
    },
  },
};
