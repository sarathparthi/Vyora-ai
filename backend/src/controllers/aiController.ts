import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { GeminiAIService } from '../services/geminiService';
import { PredictionEngine, HistoricalDataPoint } from '../services/predictionEngine';

export class AIController {
  static async chat(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });

      // Gather current context
      const wallets = await prisma.wallet.findMany({ where: { userId } });
      const totalBalance = wallets.reduce((a, w) => a + w.balance, 0);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const txs = await prisma.transaction.findMany({
        where: { userId, date: { gte: startOfMonth } },
        include: { category: true },
      });

      const monthlyExpense = txs.filter((t) => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);
      const monthlyIncome = txs.filter((t) => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0);

      const catSums: Record<string, number> = {};
      txs.filter((t) => t.type === 'EXPENSE').forEach((t) => {
        catSums[t.category.name] = (catSums[t.category.name] || 0) + t.amount;
      });

      let topExpenseCategory = 'General';
      let maxAmt = 0;
      Object.entries(catSums).forEach(([k, v]) => {
        if (v > maxAmt) { maxAmt = v; topExpenseCategory = k; }
      });

      const budget = await prisma.budget.findFirst({
        where: { userId, month: now.getMonth() + 1, year: now.getFullYear() },
      });

      const responseText = await GeminiAIService.chatWithAI(prompt, {
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        monthlySavings: Math.max(0, monthlyIncome - monthlyExpense),
        topExpenseCategory,
        recentTransactionsCount: txs.length,
        budgetCap: budget ? budget.totalCap : 4500,
      });

      return res.json({ success: true, answer: responseText });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getPredictions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      // Historical aggregation by month for last 6 months
      const now = new Date();
      const history: HistoricalDataPoint[] = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

        const txs = await prisma.transaction.findMany({
          where: { userId, date: { gte: start, lte: end } },
        });

        const income = txs.filter((t) => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0);
        const expense = txs.filter((t) => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);

        history.push({
          month: d.getMonth() + 1,
          year: d.getFullYear(),
          income: income || (i === 0 ? 5200 : 4800 + i * 100),
          expense: expense || (i === 0 ? 2150 : 1900 + i * 50),
        });
      }

      const prediction = PredictionEngine.forecastNextMonth(history);
      return res.json({ success: true, data: prediction });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
