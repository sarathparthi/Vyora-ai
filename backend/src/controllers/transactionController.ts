import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TransactionService } from '../services/transactionService';
import { prisma } from '../config/db';

export class TransactionController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const transaction = await TransactionService.createTransaction({ ...req.body, userId });
      return res.status(201).json({ success: true, data: transaction });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const result = await TransactionService.getTransactions(userId, req.query as any);
      return res.json({ success: true, ...result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await TransactionService.deleteTransaction(userId, id);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getCategories(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const categories = await prisma.category.findMany({
        where: {
          OR: [{ userId: null }, { userId }],
        },
        orderBy: { name: 'asc' },
      });
      return res.json({ success: true, data: categories });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
