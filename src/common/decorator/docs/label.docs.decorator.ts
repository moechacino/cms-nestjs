import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

export function ApiDocsCreateLabels() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiResponse({
      status: 200,
      example: {
        success: true,
        data: {
          labelId: 2,
          name: 'New Label',
        },
      },
    }),
    ApiResponse({
      status: 400,
      example: {
        success: false,
        errors: {
          message: 'Validation Error',
          details: [
            {
              property: 'labelName',
              message: 'labelName must be a string',
            },
          ],
        },
      },
    }),
  );
}
export function ApiDocsUpdateLabels() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiResponse({
      status: 200,
      example: {
        success: true,
        data: {
          labelId: 2,
          name: 'Updated Label',
        },
      },
    }),
    ApiResponse({
      status: 400,
      example: {
        success: false,
        errors: {
          message: 'Validation Error',
          details: [
            {
              property: 'labelName',
              message: 'labelName must be a string',
            },
          ],
        },
      },
    }),
  );
}
export function ApiDocsDeleteLabels() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiResponse({
      status: 200,
      example: {
        success: true,
        data: {
          labelId: 2,
          name: 'Blockchain',
        },
      },
    }),
  );
}
export function ApiDocsGetAllLabels() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      example: {
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
    }),
  );
}
export function ApiDocsGetOneLabels() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      example: {
        success: true,
        data: {
          labelId: 2,
          name: 'Blockchain',
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
