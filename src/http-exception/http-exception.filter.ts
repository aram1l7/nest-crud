import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: string[];
  error?: string; // Add optional error field
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

    // Ensure exceptionResponse is an object before accessing properties
    if (
      exception instanceof BadRequestException &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      errorResponse = {
        statusCode: status,
        message: 'Validation failed',
        errors: Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message
          : [exceptionResponse.message],
      };
    } else if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      errorResponse = {
        statusCode: status,
        message: (exceptionResponse as { message: string }).message,
      };
    } else if (typeof exceptionResponse === 'string') {
      errorResponse = {
        statusCode: status,
        message: exceptionResponse,
      };
    }

    // Attach stack trace in development mode for debugging
    if (isDev) {
      errorResponse = { ...errorResponse, error: exception.stack };
    }

    response.status(status).json(errorResponse);
  }
}
