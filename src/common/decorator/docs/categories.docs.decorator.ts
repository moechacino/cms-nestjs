import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

export function ApiDocsGetAllCategories() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      example: {
        success: true,
        data: [
          {
            categoryId: 1,
            name: 'business',
          },
          {
            categoryId: 2,
            name: 'technology',
          },
        ],
      },
    }),
  );
}
export function ApiDocsGetOneCategories() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      example: {
        success: true,
        data: {
          categoryId: 2,
          name: 'technology',
        },
      },
    }),
  );
}

export function ApiDocsCreateCategories() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiResponse({
      status: 201,
      example: {
        success: true,
        data: {
          categoryId: 3,
          name: 'new categoryyy',
        },
      },
    }),
  );
}

export function ApiDocsUpdateCategories() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiResponse({
      status: 200,
      example: {
        success: true,
        data: {
          categoryId: 2,
          name: 'updated category',
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
export function ApiDocsDeleteCategories() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiResponse({
      status: 200,
      example: {
        success: true,
        data: {
          categoryId: 3,
          name: 'new categoryyy',
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
