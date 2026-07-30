import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';

export class BudgetController {
  static async getMonthlyBudget(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const now = new Date();
      const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
      const year = req.query.year ? Number(req.query.year) : now.getFullYear();

      let budget = await prisma.budget.findUnique({
        where: {
          userId_month_year: { userId, month, year },
        },
        include: {
          categories: {
            include: { category: true },
          },
        },
      });

      // Compute actual spending for this month
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);

      const categoryExpenses = await prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      });

      const expenseMap = new Map<string, number>();
      categoryExpenses.forEach((item) => {
        expenseMap.set(item.categoryId, item._sum.amount || 0);
      });

      const totalSpent = Array.from(expenseMap.values()).reduce((a, b) => a + b, 0);

      return res.json({
        success: true,
        data: {
          budget,
          month,
          year,
          totalSpent,
          categorySpending: Array.from(expenseMap.entries()).map(([catId, amount]) => ({
            categoryId: catId,
            spent: amount,
          })),
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async setBudget(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { title, totalCap, month, year, alertPercent } = req.body;

      const budget = await prisma.budget.upsert({
        where: {
          userId_month_year: { userId, month: Number(month), year: Number(year) },
        },
        update: {
          totalCap: Number(totalCap),
          alertPercent: Number(alertPercent) || 80,
        },
        create: {
          userId,
          title: title || 'Monthly Budget',
          totalCap: Number(totalCap),
          month: Number(month),
          year: Number(year),
          alertPercent: Number(alertPercent) || 80,
        },
      });

      return res.json({ success: true, data: budget });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
