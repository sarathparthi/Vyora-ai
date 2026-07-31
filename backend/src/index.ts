import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import { globalRateLimiter, authRateLimiter } from './middleware/rateLimiter';
import { authenticateJWT } from './middleware/auth';
import { setupSwagger } from './swagger';
import { EmailLogger } from './services/emailLogger';

// Controllers
import { AuthController } from './controllers/authController';
import { TransactionController } from './controllers/transactionController';
import { WalletController } from './controllers/walletController';
import { BudgetController } from './controllers/budgetController';
import { AnalyticsController } from './controllers/analyticsController';
import { AIController } from './controllers/aiController';

const app = express();

// Trust reverse proxy for Vercel deployment
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());
app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(globalRateLimiter);

// Setup Swagger Docs
setupSwagger(app);

// Public Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: new Date().toISOString(), service: 'Vyora Enterprise API Engine' });
});

// Developer Accounts JSON Endpoint (Public for Dev)
app.get('/api/dev/accounts', (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'dev_accounts.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return res.json({ success: true, data: JSON.parse(data || '[]') });
    }
    return res.json({ success: true, data: [] });
  } catch (err: any) {
    return res.json({ success: true, data: [] });
  }
});

// Developer Email Dispatch Monitor Endpoint (Public for Dev)
app.get('/api/dev/email-logs', (req, res) => {
  try {
    const logs = EmailLogger.getLogs();
    return res.json({ success: true, data: logs });
  } catch (err: any) {
    return res.json({ success: true, data: [] });
  }
});

// Public Authentication Endpoints
app.post('/api/auth/register', authRateLimiter, AuthController.register);
app.post('/api/auth/verify-otp', authRateLimiter, AuthController.verifyOTP);
app.post('/api/auth/login', authRateLimiter, AuthController.login);
app.post('/api/auth/forgot-password', authRateLimiter, AuthController.requestPasswordReset);
app.post('/api/auth/reset-password', authRateLimiter, AuthController.resetPassword);

// Protected Routes (Require JWT)
app.get('/api/auth/me', authenticateJWT, AuthController.getProfile);
app.get('/api/auth/sessions', authenticateJWT, AuthController.getActiveSessions);
app.delete('/api/auth/sessions/:id', authenticateJWT, AuthController.revokeSession);

// Transactions & Categories (Protected)
app.get('/api/transactions', authenticateJWT, TransactionController.list);
app.post('/api/transactions', authenticateJWT, TransactionController.create);
app.delete('/api/transactions/:id', authenticateJWT, TransactionController.delete);
app.get('/api/categories', authenticateJWT, TransactionController.getCategories);

// Wallets & Accounts (Protected)
app.get('/api/wallets', authenticateJWT, WalletController.list);
app.post('/api/wallets', authenticateJWT, WalletController.create);

// Budgets (Protected)
app.get('/api/budgets', authenticateJWT, BudgetController.getMonthlyBudget);
app.post('/api/budgets', authenticateJWT, BudgetController.setBudget);

// Analytics (Protected)
app.get('/api/analytics/dashboard', authenticateJWT, AnalyticsController.getDashboardOverview);
app.get('/api/analytics/cashflow', authenticateJWT, AnalyticsController.getCashFlowTrends);

// AI & Predictions (Protected)
app.post('/api/ai/chat', authenticateJWT, AIController.chat);
app.get('/api/ai/predictions', authenticateJWT, AIController.getPredictions);

// Start Server
async function startServer() {
  await connectDB();
  const PORT = Number(ENV.PORT);
  app.listen(PORT, () => {
    console.log(`🚀 Vyora Enterprise Backend Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Error:', err);
});
