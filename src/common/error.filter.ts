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
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    if (exception instanceof HttpException) {
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse.message || 'An error occurred';
      response.status(statusCode).json({
        success: false,
        errors: {
          message: message,
        },
      });
    }
    // --- Start of Handling Prisma or Database Error
    else if (exception instanceof PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          response.status(400).json({
            statusCode: 400,
            success: false,
            errors: { message: 'Unique constraint violation' },
          });
          break;
        case 'P2001':
        case 'P2015':
        case 'P2025':
          response.status(404).json({
            statusCode: 404,
            success: false,
            errors: { message: 'Record not found' },
          });
          break;
        case 'P2034':
          response.status(500).json({
            statusCode: 500,
            success: false,
            errors: { message: 'Transaction failed' },
          });
          break;
        default:
          response.status(500).json({
            statusCode: 500,
            success: false,
            errors: { message: 'Database error' },
          });
          break;
      }
    } else if (exception instanceof PrismaClientInitializationError) {
      response.status(500).json({
        statusCode: 500,
        success: false,
        errors: { message: 'Database initialization error' },
      });
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      response.status(500).json({
        statusCode: 500,
        success: false,
        errors: {
          message: 'Unknown database error, please check the server logs',
        },
      });
    }
    // --- End of Handling Prisma or Database Error

    // Handle unknown errors
    else {
      response.status(500).json({
        statusCode: 500,
        success: false,
        errors: { message: 'Internal Server Error' },
      });
    }

    this.logger.error(exception.message, { exception });
  }
}
