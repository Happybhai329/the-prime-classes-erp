import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Generate or use existing Request ID (correlation ID)
    const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
    
    // Propagate request ID
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);

    // Apply security headers not covered by Helmet
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), camera=(), microphone=(), payment=(), usb=()'
    );

    next();
  }
}
