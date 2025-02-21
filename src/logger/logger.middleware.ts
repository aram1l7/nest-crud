import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    console.log(`Incoming request: ${req.method} ${req.url}`);
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`Request ${req.method} ${req.url} took ${duration}ms`);
    });
    next();
  }
}
