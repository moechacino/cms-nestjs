import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
} from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import { Response, Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ErrResponse } from './types/web.type';
import { JsonWebTokenError } from '@nestjs/jwt';
import * as fs from 'fs';
@Catch(
  HttpException,
  PrismaClientKnownRequestError,
  PrismaClientInitializationError,
  PrismaClientUnknownRequestError,
  Error,
)
export class ErrorFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  private async deleteUploadedFiles(request: Request) {
    const files: string[] = [];
    if (request.file) files.push(request.file.path);
    if (request.files && Array.isArray(request.files)) {
      files.push(...request.files.map((file) => file.path));
    }

    for (const filePath of files) {
      await fs.promises
        .unlink(filePath)
        .catch((err) =>
          this.logger.error(`Failed to delete ${filePath}`, { error: err }),
        );
    }
  }

  private handlePrismaError(exception: PrismaClientKnownRequestError): {
    statusCode: number;
    errResponse: ErrResponse;
  } {
    let statusCode = 500;
    let message = 'Database error';

    const prismaErrorMap: Record<
      string,
      { statusCode: number; message: string }
    > = {
      P2002: { statusCode: 400, message: 'Unique constraint violation' },
      P2001: { statusCode: 404, message: 'Record not found' },
      P2015: { statusCode: 404, message: 'Record not found' },
      P2025: { statusCode: 404, message: 'Record not found' },
      P2034: { statusCode: 500, message: 'Transaction failed' },
    };

    const error = prismaErrorMap[exception.code];
    if (error) {
      statusCode = error.statusCode;
      message = error.message;
    }

    return {
      statusCode,
      errResponse: {
        success: false,
        errors: { message },
      },
    };
  }

  async catch(exception: any, host: ArgumentsHost) {
    const response: Response = host.switchToHttp().getResponse();
    const request: Request = host.switchToHttp().getRequest();
    let errResponse: ErrResponse;
    let statusCode: number;

    // Delete files if uploaded
    await this.deleteUploadedFiles(request);

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : // @ts-ignore
            exceptionResponse.message || 'An error occurred';

      errResponse =
        statusCode === 400 && typeof message !== 'string'
          ? {
              success: false,
              errors: {
                message: 'Validation Error',
                details: message,
              },
            }
          : {
              success: false,
              errors: { message },
            };
    } else if (exception instanceof PrismaClientKnownRequestError) {
      ({ statusCode, errResponse } = this.handlePrismaError(exception));
    } else if (exception instanceof PrismaClientInitializationError) {
      statusCode = 500;
      errResponse = {
        success: false,
        errors: { message: 'Database initialization error' },
      };
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      statusCode = 500;
      errResponse = {
        success: false,
        errors: {
          message: 'Unknown database error, please check the server logs',
        },
      };
    } else if (exception instanceof JsonWebTokenError) {
      statusCode = 401;
      errResponse = {
        success: false,
        errors: { message: 'Invalid Token' },
      };
    } else {
      statusCode = 500;
      errResponse = {
        success: false,
        errors: { message: 'Internal Server Error' },
      };
    }

    response.status(statusCode).json(errResponse);
    this.logger.error(exception.message, { exception });
  }
}
