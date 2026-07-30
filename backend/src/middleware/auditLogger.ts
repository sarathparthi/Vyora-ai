import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { prisma } from '../config/db';

export const auditLogger = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', async () => {
    const duration = Date.now() - start;
    const userId = req.user?.userId || null;
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Only log non-GET modifying actions or auth events to prevent log bloat
    if (req.method !== 'GET') {
      try {
        await prisma.securityAuditLog.create({
          data: {
            userId,
            event: `${req.method} ${req.originalUrl}`,
            details: `Status: ${res.statusCode} | Duration: ${duration}ms`,
            ipAddress,
            userAgent,
          },
        });
      } catch (err) {
        // Silently catch audit log failure to not interrupt primary HTTP response
      }
    }
  });

  next();
};
