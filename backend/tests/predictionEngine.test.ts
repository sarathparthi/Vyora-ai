import { PredictionEngine, HistoricalDataPoint } from '../src/services/predictionEngine';

describe('PredictionEngine Math Unit Tests', () => {
  it('should calculate Simple Moving Average correctly', () => {
    const values = [100, 200, 300, 400, 500];
    const sma = PredictionEngine.calculateSMA(values, 3);
    // Average of 300, 400, 500 = 400
    expect(sma).toBe(400);
  });

  it('should compute linear regression slope and intercept', () => {
    const yValues = [10, 20, 30, 40]; // Perfect line y = 10x + 0
    const { slope, intercept } = PredictionEngine.linearRegression(yValues);
    expect(slope).toBeCloseTo(10);
    expect(intercept).toBeCloseTo(0);
  });

  it('should forecast next month spending with risk levels', () => {
    const history: HistoricalDataPoint[] = [
      { month: 1, year: 2026, income: 5000, expense: 2000 },
      { month: 2, year: 2026, income: 5200, expense: 2100 },
      { month: 3, year: 2026, income: 5100, expense: 2200 },
    ];

    const forecast = PredictionEngine.forecastNextMonth(history);

    expect(forecast.predictedIncome).toBeGreaterThan(0);
    expect(forecast.predictedExpense).toBeGreaterThan(0);
    expect(forecast.confidenceScore).toBeGreaterThanOrEqual(0.7);
    expect(['LOW', 'MEDIUM', 'HIGH']).toContain(forecast.riskLevel);
  });
});
