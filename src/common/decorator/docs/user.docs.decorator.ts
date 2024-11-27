import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export function ApiDocsUserLogin() {
  return applyDecorators(
    ApiOperation({
      summary: 'login user admin',
    }),

    ApiResponse({
      status: 200,
      description: 'Successful login with cookies set',
      headers: {
        'Set-Cookie': {
          description: 'Refresh token stored in cookies',
          schema: {
            type: 'string',
            example:
              'admin_rt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=2592000',
          },
        },
      },
      example: {
        success: true,
        data: {
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzZjliYmFmNC00Y2Y3LTQ3YzMtYTNlOS01MDliNmVkYjM5ZDkiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzMyNjkyOTQ5LCJleHAiOjE3MzI2OTY1NDl9.FiB5Y_drDO0U0gW3z1ygIh_IW70eukMvpFe3R2N9yjo',
          user: {
            username: 'admin',
          },
        },
      },
    }),

    ApiResponse({
      status: 401,
      example: {
        success: false,
        errors: {
          message: 'wrong username or password',
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
              property: 'username',
              message: 'username should not be empty',
            },
            {
              property: 'password',
              message: 'password should not be empty',
            },
          ],
        },
      },
    }),
  );
}

export function ApiDocsUserLogout() {
  return applyDecorators(
    ApiBearerAuth('token'),
    ApiResponse({
      status: 200,
      example: {
        success: true,
      },
    }),
    ApiResponse({
      status: 401,
      examples: {
        ex1: {
          summary: 'logged out',
          value: {
            success: false,
            errors: {
              message: 'You have been logged out. Please login again',
            },
          },
        },
        ex2: {
          summary: 'unauth',
          value: {
            success: false,
            errors: {
              message: 'Unauthorized',
            },
          },
        },
      },
    }),
  );
}

export function ApiDocsUserNewAccessToken() {
  return applyDecorators(
    ApiResponse({
      status: 401,
      examples: {
        ex1: {
          summary: 'Unauth',
          value: {
            success: false,
            errors: {
              message: 'Unauthorized',
            },
          },
        },
        ex2: {
          summary: 'Logged in another device',
          value: {
            success: false,
            errors: {
              message: 'Logged in another device. Please login again',
            },
          },
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
      description: 'user not registered',
    }),
    ApiResponse({
      status: 200,
      example: {
        success: true,
        data: {
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzZjliYmFmNC00Y2Y3LTQ3YzMtYTNlOS01MDliNmVkYjM5ZDkiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzMyNzEwNjA2LCJleHAiOjE3MzUzMDI2MDZ9.6GMX8IMKDbtwyFOyEBUZ3FRRLj9-dAyWw8ICg3aKKuU',
        },
      },
    }),
    ApiOperation({
      summary: 'get new access token with refresh token',
    }),
  );
}
