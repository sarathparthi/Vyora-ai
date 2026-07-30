import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { prisma } from '../config/db';

export async function logAuditEvent(req: AuthRequest, action: string, details: string) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.userId || null,
        action,
        details,
        ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Unknown',
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
