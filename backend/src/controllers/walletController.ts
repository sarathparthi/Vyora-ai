import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';

export class WalletController {
  static async list(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const wallets = await prisma.wallet.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      return res.json({ success: true, data: wallets });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { name, type, balance, currency, accountNumber, color } = req.body;
      const wallet = await prisma.wallet.create({
        data: {
          userId,
          name,
          type: type || 'BANK_ACCOUNT',
          balance: Number(balance) || 0,
          currency: currency || 'USD',
          accountNumber,
          color: color || '#3B82F6',
        },
      });
      return res.status(201).json({ success: true, data: wallet });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
