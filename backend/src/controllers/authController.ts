import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { logAuditEvent } from '../middleware/auditLogger';
import { prisma } from '../config/db';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ success: false, message: 'Email, password, and name are required' });
      }

      const result = await AuthService.registerUser({ email, password, name, role });
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const result = await AuthService.loginUser(email, password, req.ip, req.headers['user-agent']);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(401).json({ success: false, message: error.message });
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          currency: true,
          avatarUrl: true,
          isVerified: true,
          createdAt: true,
          wallets: true,
        },
      });

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
