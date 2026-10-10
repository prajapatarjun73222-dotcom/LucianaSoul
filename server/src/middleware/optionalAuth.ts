import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import type { AuthPayload } from './auth.js';

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  if (header.startsWith('Bearer ')) {
    try {
      req.admin = jwt.verify(header.slice(7), config.jwtSecret) as AuthPayload;
    } catch {
      // treat as anonymous
    }
  }
  next();
}
