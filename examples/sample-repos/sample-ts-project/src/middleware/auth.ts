import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AuthMiddleware {
  static validateToken(req: Request, res: Response, next: NextFunction) {
    // Skip auth for health check
    if (req.path === '/health') {
      return next();
    }

    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      logger.warn('Request without token:', req.path);
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Simple token validation (in production, use proper JWT verification)
    if (token.length < 20) {
      logger.warn('Invalid token format');
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user info to request (mock)
    (req as any).user = { id: 'user_123', role: 'admin' };
    next();
  }

  static requireAdmin(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;

    if (!user || user.role !== 'admin') {
      logger.warn('Non-admin access attempt:', user?.id);
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  }
}
