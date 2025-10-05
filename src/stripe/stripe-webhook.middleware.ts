import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';

@Injectable()
export class StripeWebhookMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl === '/locations/webhook' && req.method === 'POST') {
      bodyParser.raw({ type: 'application/json' })(req, res, next);
    } else {
      next();
    }
  }
}