import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const isDev = process.env.NODE_ENV === 'development';

    console.error('Error occurred:', exception);

    let errorResponse: ErrorResponse = {
      statusCode: status,
      message: 'Something went wrong. Please try again later.',
    };

    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const validationErrors = (exceptionResponse as { message: unknown })
          .message;

        if (Array.isArray(validationErrors)) {
          errorResponse = {
            statusCode: status,
            message: 'Validation failed',
            errors: validationErrors,
          };
        }
      }
    } else if (exception instanceof UnauthorizedException) {
      errorResponse = {
        statusCode: status,
        message: 'Unauthorized access',
      };
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      errorResponse = {
        statusCode: status,
        message: String((exceptionResponse as { message: unknown }).message),
      };
    } else if (typeof exceptionResponse === 'string') {
      errorResponse = {
        statusCode: status,
        message: exceptionResponse,
      };
    }

    if (isDev) {
      errorResponse = { ...errorResponse, error: exception.stack };
    }

    response.status(status).json(errorResponse);
  }
}
