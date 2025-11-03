declare module 'cookie-parser' {
  import { RequestHandler } from 'express';

  interface CookieParserOptions {
    decode?: (val: string) => string;
  }

  function cookieParser(secret?: string | string[], options?: CookieParserOptions): RequestHandler;

  export = cookieParser;
}

