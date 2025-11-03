declare module 'compression' {
  import { RequestHandler } from 'express';

  interface CompressionOptions {
    threshold?: number;
    filter?: (req: any, res: any) => boolean;
    level?: number;
    memLevel?: number;
    strategy?: number;
    chunkSize?: number;
    windowBits?: number;
    zlibOptions?: any;
  }

  function compression(options?: CompressionOptions): RequestHandler;

  export = compression;
}

