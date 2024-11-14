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
import { Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ErrResponse } from './types/web.type';
import { JsonWebTokenError } from '@nestjs/jwt';

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
  catch(exception: any, host: ArgumentsHost) {
    const response: Response = host.switchToHttp().getResponse();
    let errResponse: ErrResponse;
    let statusCode: number;
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : // @ts-ignore
            exceptionResponse.message || 'An error occurred';

      if (statusCode === 400 && typeof message !== 'string') {
        errResponse = {
          success: false,
          errors: {
            message: 'Validation Error',
            details: message,
          },
        };
      } else {
        errResponse = {
          success: false,
          errors: {
            message: message,
          },
        };
      }
    }
    // --- Start of Handling Prisma or Database Error
    else if (exception instanceof PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          statusCode = 400;
          errResponse = {
            success: false,
            errors: { message: 'Unique constraint violation' },
          };
          break;
        case 'P2001':
        case 'P2015':
        case 'P2025':
          statusCode = 404;
          errResponse = {
            success: false,
            errors: { message: 'Record not found' },
          };
          break;
        case 'P2034':
          statusCode = 500;
          errResponse = {
            success: false,
            errors: { message: 'Transaction failed' },
          };
          break;
        default:
          statusCode = 500;
          errResponse = {
            success: false,
            errors: { message: 'Database error' },
          };
          break;
      }
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
    }
    // --- End of Handling Prisma or Database Error
    else if (exception instanceof JsonWebTokenError) {
      statusCode = 401;
      errResponse = {
        success: false,
        errors: {
          message: 'Invalid Token',
        },
      };
    }
    // Handle unknown errors
    else {
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
