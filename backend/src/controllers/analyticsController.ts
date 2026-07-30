import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { GeminiAIService } from '../services/geminiService';

export class AnalyticsController {
  static async getDashboardOverview(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // 1. Wallets Total Balance
      const wallets = await prisma.wallet.findMany({ where: { userId } });
      const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

      // 2. Today's Expense & Income
      const todayTx = await prisma.transaction.findMany({
        where: { userId, date: { gte: startOfToday } },
      });
      const todayExpense = todayTx.filter((t) => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);
      const todayIncome = todayTx.filter((t) => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0);

      // 3. Monthly Income & Expense
      const monthlyTx = await prisma.transaction.findMany({
        where: { userId, date: { gte: startOfMonth } },
        include: { category: true },
      });
      const monthlyExpense = monthlyTx.filter((t) => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);
      const monthlyIncome = monthlyTx.filter((t) => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0);
      const monthlySavings = Math.max(0, monthlyIncome - monthlyExpense);

      // 4. Current Budget Cap
      const budget = await prisma.budget.findFirst({
        where: { userId, month: now.getMonth() + 1, year: now.getFullYear() },
      });
      const budgetCap = budget ? budget.totalCap : 4500.0;
      const budgetRemaining = Math.max(0, budgetCap - monthlyExpense);

      // 5. Top Expense Category
      const catSums: Record<string, number> = {};
      monthlyTx
        .filter((t) => t.type === 'EXPENSE')
        .forEach((t) => {
          const name = t.category.name;
          catSums[name] = (catSums[name] || 0) + t.amount;
        });

      let topExpenseCategory = 'General';
      let maxCatAmount = 0;
      Object.entries(catSums).forEach(([name, amt]) => {
        if (amt > maxCatAmount) {
          maxCatAmount = amt;
          topExpenseCategory = name;
        }
      });

      // 6. Calculate Financial Health Score
      const healthData = GeminiAIService.calculateHealthScore({
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        monthlySavings,
        topExpenseCategory,
        recentTransactionsCount: monthlyTx.length,
        budgetCap,
      });

      // 7. Recent Transactions
      const recentTransactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 6,
        include: { category: true, wallet: true },
      });

      return res.json({
        success: true,
        data: {
          totalBalance,
          todayExpense,
          todayIncome,
          monthlyIncome,
          monthlyExpense,
          monthlySavings,
          budgetCap,
          budgetRemaining,
          healthScore: healthData,
          topExpenseCategory,
          recentTransactions,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getCashFlowTrends(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const months = 6;
      const result: Array<{ month: string; income: number; expense: number; savings: number }> = [];

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

        const txs = await prisma.transaction.findMany({
          where: { userId, date: { gte: start, lte: end } },
        });

        const income = txs.filter((t) => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0);
        const expense = txs.filter((t) => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);

        result.push({
          month: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
          income,
          expense,
          savings: Math.max(0, income - expense),
        });
      }

      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
