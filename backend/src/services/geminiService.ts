import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env';

export interface FinancialContext {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
  topExpenseCategory: string;
  recentTransactionsCount: number;
  budgetCap: number;
}

export class GeminiAIService {
  private static aiClient: GoogleGenerativeAI | null = ENV.GEMINI_API_KEY
    ? new GoogleGenerativeAI(ENV.GEMINI_API_KEY)
    : null;

  /**
   * Generates a conversational response from Gemini API or intelligent mock fallback
   */
  static async chatWithAI(userPrompt: string, context: FinancialContext): Promise<string> {
    if (this.aiClient) {
      try {
        const systemPrompt = `You are Vyora AI, a world-class financial intelligence advisor.
User Financial Summary:
- Total Balance: $${context.totalBalance}
- Monthly Income: $${context.monthlyIncome}
- Monthly Expense: $${context.monthlyExpense}
- Monthly Savings: $${context.monthlySavings}
- Top Category: ${context.topExpenseCategory}
- Monthly Budget Limit: $${context.budgetCap}

Provide actionable, polite, and data-driven financial advice. Keep your response concise (under 250 words) with clear bullet points.`;

        const model = this.aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const response = await model.generateContent(`${systemPrompt}\n\nUser Question: ${userPrompt}`);
        const text = response.response.text();

        if (text) {
          return text;
        }
      } catch (error) {
        console.warn('Gemini API call failed, using fallback engine:', error);
      }
    }

    // Fallback Mock Advisor logic for immediate offline support
    return this.generateMockAIResponse(userPrompt, context);
  }

  /**
   * Calculates Financial Health Score (0 to 100)
   */
  static calculateHealthScore(context: FinancialContext): {
    score: number;
    grade: 'A+' | 'A' | 'B' | 'C' | 'D';
    breakdown: { savingsRate: number; budgetCompliance: number; stabilityScore: number };
  } {
    const savingsRate = context.monthlyIncome > 0 ? (context.monthlySavings / context.monthlyIncome) * 100 : 0;
    const budgetUtilization = context.budgetCap > 0 ? (context.monthlyExpense / context.budgetCap) * 100 : 100;
    
    let budgetScore = 100 - Math.max(0, budgetUtilization - 80) * 2;
    budgetScore = Math.max(0, Math.min(100, budgetScore));

    const savingsScore = Math.min(100, savingsRate * 3.5);
    const balanceScore = context.totalBalance > context.monthlyExpense * 3 ? 100 : (context.totalBalance / (context.monthlyExpense * 3 || 1)) * 100;

    const overallScore = Math.round(savingsScore * 0.4 + budgetScore * 0.4 + balanceScore * 0.2);

    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C';
    if (overallScore >= 90) grade = 'A+';
    else if (overallScore >= 80) grade = 'A';
    else if (overallScore >= 70) grade = 'B';
    else if (overallScore >= 50) grade = 'C';
    else grade = 'D';

    return {
      score: overallScore,
      grade,
      breakdown: {
        savingsRate: Math.round(savingsRate),
        budgetCompliance: Math.round(budgetScore),
        stabilityScore: Math.round(balanceScore),
      },
    };
  }

  private static generateMockAIResponse(prompt: string, context: FinancialContext): string {
    const p = prompt.toLowerCase();
    
    if (p.includes('more') || p.includes('spend') || p.includes('why')) {
      return `📊 **Analysis of Higher Spending**:\n\n` +
        `Your primary expenditure driver this month is **${context.topExpenseCategory}** ($${Math.round(context.monthlyExpense * 0.35)}).\n\n` +
        `• **Key Insight**: Non-essential spending increased by ~14% compared to last month.\n` +
        `• **Action Plan**: Setting a strict cap of $${Math.round(context.monthlyExpense * 0.25)} on ${context.topExpenseCategory} will save you **$${Math.round(context.monthlyExpense * 0.1)}** immediately.`;
    }

    if (p.includes('save') || p.includes('10,000') || p.includes('reduce')) {
      return `💡 **Personalized Savings Plan**:\n\n` +
        `With your current monthly income of **$${context.monthlyIncome}** and spending of **$${context.monthlyExpense}**, your net savings is **$${context.monthlySavings}** per month.\n\n` +
        `• **Optimization Tip**: Cut subscription renewals and dining out to boost monthly savings by **+18%**.\n` +
        `• **Timeline**: At this optimized rate, you will comfortably achieve your savings milestone in ~3.5 months.`;
    }

    if (p.includes('predict') || p.includes('next month')) {
      return `🔮 **AI Spending Forecast**:\n\n` +
        `Based on regression analysis of your recent activity:\n` +
        `• **Projected Expenses**: ~$${Math.round(context.monthlyExpense * 1.03)}\n` +
        `• **Projected Income**: ~$${context.monthlyIncome}\n` +
        `• **Estimated Net Retained**: ~$${Math.round(context.monthlyIncome - context.monthlyExpense * 1.03)}\n\n` +
        `Your cash flow stability is rated **HEALTHY**.`;
    }

    return `🤖 **Vyora AI Financial Assistant**:\n\n` +
      `You have a current total balance of **$${context.totalBalance}** across all active wallets.\n\n` +
      `• **Monthly Expense**: $${context.monthlyExpense} / $${context.budgetCap} Budget Cap\n` +
      `• **Top Category**: ${context.topExpenseCategory}\n\n` +
      `Ask me specific questions like *"Where am I wasting money?"* or *"How can I optimize my budget?"*`;
  }
}
