import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
      }

      const result = await AuthService.registerUser({ email, password, name });
      return res.status(201).json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
      }

      const result = await AuthService.verifyEmailOTP(email, otp);
      return res.json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password, rememberMe } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const result = await AuthService.loginUser({
        email,
        password,
        rememberMe: Boolean(rememberMe),
        ipAddress,
        userAgent,
      });

      // Set Refresh Token in HttpOnly, Secure, SameSite=Strict Cookie
      res.cookie('vyora_refresh_token', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000,
      });

      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(401).json({ success: false, message: error.message });
    }
  }

  static async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, message: 'Email address is required.' });

      const result = await AuthService.requestPasswordReset(email);
      return res.json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required.' });
      }

      const result = await AuthService.resetPassword(email, otp, newPassword);
      return res.json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getActiveSessions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const sessions = await AuthService.getActiveSessions(userId);
      return res.json({ success: true, data: sessions });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async revokeSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await AuthService.revokeSession(userId, id);
      return res.json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
