import jwt from 'jsonwebtoken';
import { config } from '../config.js';
export function optionalAuth(req, _res, next) {
    const header = req.headers.authorization ?? '';
    if (header.startsWith('Bearer ')) {
        try {
            req.admin = jwt.verify(header.slice(7), config.jwtSecret);
        }
        catch {
            // treat as anonymous
        }
    }
    next();
}
