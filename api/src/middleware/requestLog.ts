import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { logger, type Logger } from '../lib/logger.js';

declare module 'express-serve-static-core' {
  interface Request {
    id: string;
    log: Logger;
  }
}

export function requestLog(req: Request, res: Response, next: NextFunction): void {
  req.id = req.header('x-request-id') ?? randomUUID();
  req.log = logger.child({ reqId: req.id });
  res.setHeader('x-request-id', req.id);

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    req.log[level](
      {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durMs: Math.round(durMs),
        ip: req.ip,
      },
      'http',
    );
  });

  next();
}
