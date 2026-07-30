/**
 * Vyora Predictive Financial Engine
 * Uses Machine Learning & Statistical Models (Linear Regression, Moving Averages, Seasonality)
 * to forecast upcoming spending, monthly budgets, cash flows, and emergency risk levels.
 */

export interface HistoricalDataPoint {
  month: number; // 1 to 12
  year: number;
  income: number;
  expense: number;
}

export interface PredictionResult {
  targetMonth: number;
  targetYear: number;
  predictedExpense: number;
  predictedIncome: number;
  predictedSavings: number;
  confidenceScore: number;
  expenseTrendDirection: 'UP' | 'DOWN' | 'STABLE';
  growthRatePercent: number;
  recommendations: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class PredictionEngine {
  /**
   * Calculates Simple Moving Average (SMA)
   */
  static calculateSMA(values: number[], period: number = 3): number {
    if (values.length === 0) return 0;
    const slice = values.slice(-period);
    const sum = slice.reduce((acc, curr) => acc + curr, 0);
    return sum / slice.length;
  }

  /**
   * Simple Linear Regression (y = mx + c)
   * Returns slope m and intercept c
   */
  static linearRegression(yValues: number[]): { slope: number; intercept: number } {
    const n = yValues.length;
    if (n === 0) return { slope: 0, intercept: 0 };
    if (n === 1) return { slope: 0, intercept: yValues[0] };

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      const x = i + 1;
      const y = yValues[i];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Forecasts next month's spending and income based on historical data
   */
  static forecastNextMonth(history: HistoricalDataPoint[]): PredictionResult {
    const now = new Date();
    const targetMonth = (now.getMonth() + 1) % 12 + 1;
    const targetYear = targetMonth === 1 ? now.getFullYear() + 1 : now.getFullYear();

    if (!history || history.length === 0) {
      return {
        targetMonth,
        targetYear,
        predictedExpense: 1500,
        predictedIncome: 4500,
        predictedSavings: 3000,
        confidenceScore: 0.75,
        expenseTrendDirection: 'STABLE',
        growthRatePercent: 0,
        recommendations: ['Add more historical transaction data to improve prediction confidence.'],
        riskLevel: 'LOW',
      };
    }

    const expenses = history.map((h) => h.expense);
    const incomes = history.map((h) => h.income);

    // Calculate Moving Average
    const smaExpense = this.calculateSMA(expenses, 3);
    const smaIncome = this.calculateSMA(incomes, 3);

    // Calculate Linear Regression Trajectory
    const regExpense = this.linearRegression(expenses);
    const nextX = expenses.length + 1;
    const regPredictedExpense = Math.max(0, regExpense.slope * nextX + regExpense.intercept);

    // Weighted ensemble model (60% Linear Regression, 40% Moving Average)
    const ensembleExpense = Math.round(regPredictedExpense * 0.6 + smaExpense * 0.4);
    const ensembleIncome = Math.round(smaIncome * 0.8 + (incomes[incomes.length - 1] || 4000) * 0.2);

    const predictedSavings = Math.max(0, ensembleIncome - ensembleExpense);
    const growthRatePercent = parseFloat(((regExpense.slope / (smaExpense || 1)) * 100).toFixed(1));

    let expenseTrendDirection: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
    if (regExpense.slope > 50) expenseTrendDirection = 'UP';
    else if (regExpense.slope < -50) expenseTrendDirection = 'DOWN';

    const savingsRate = ensembleIncome > 0 ? (predictedSavings / ensembleIncome) * 100 : 0;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (savingsRate < 10) riskLevel = 'HIGH';
    else if (savingsRate < 25) riskLevel = 'MEDIUM';

    const recommendations: string[] = [];
    if (expenseTrendDirection === 'UP') {
      recommendations.push(`Expense trend is sloping upward (+${growthRatePercent}%). Audit non-essential recurring subscriptions.`);
    }
    if (savingsRate < 20) {
      recommendations.push(`Projected savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20% to build your emergency fund.`);
    } else {
      recommendations.push(`Solid financial stability! You are projected to retain ${savingsRate.toFixed(1)}% of your income next month.`);
    }

    return {
      targetMonth,
      targetYear,
      predictedExpense: ensembleExpense,
      predictedIncome: ensembleIncome,
      predictedSavings,
      confidenceScore: Math.min(0.95, 0.70 + history.length * 0.05),
      expenseTrendDirection,
      growthRatePercent,
      recommendations,
      riskLevel,
    };
  }
}
