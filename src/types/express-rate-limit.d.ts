declare module 'express-rate-limit' {
  import { RequestHandler } from 'express';

  interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    message?: any;
    statusCode?: number;
    headers?: boolean;
    skipFailedRequests?: boolean;
    skipSuccessfulRequests?: boolean;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
    keyGenerator?: (req: any, res: any) => string;
    handler?: (req: any, res: any, next: any) => void;
    skip?: (req: any, res: any) => boolean;
    requestWasSuccessful?: (req: any, res: any) => boolean;
    onLimitReached?: (req: any, res: any, options: RateLimitOptions) => void;
    store?: any;
  }

  function rateLimit(options?: Partial<RateLimitOptions>): RequestHandler;

  export = rateLimit;
}

