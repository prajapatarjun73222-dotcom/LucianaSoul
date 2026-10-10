import jwt from 'jsonwebtoken';
import { config } from '../config.js';
export function signToken(payload) {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}
export function requireAuth(req, res, next) {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token)
        return res.status(401).json({ error: 'Authentication required' });
    try {
        req.admin = jwt.verify(token, config.jwtSecret);
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired session' });
    }
}
export function requireDeveloper(req, res, next) {
    if (req.admin?.role !== 'developer')
        return res.status(403).json({ error: 'Developer access required' });
    next();
}
