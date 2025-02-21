import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = new Date();
    const url = req.originalUrl;

    console.log(`Start: ${req.method} ${url} at ${start.toISOString()}`);

    res.on('finish', () => {
      const end = new Date();
      const duration = end.getTime() - start.getTime();
      console.log(
        `End: ${req.method} ${url} at ${end.toISOString()} (Duration: ${duration}ms)`,
      );
    });

    next();
  }
}
