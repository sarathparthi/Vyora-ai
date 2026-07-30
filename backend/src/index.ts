import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import { globalRateLimiter, authRateLimiter } from './middleware/rateLimiter';
import { authenticateJWT } from './middleware/auth';
import { setupSwagger } from './swagger';

// Controllers
import { AuthController } from './controllers/authController';
import { TransactionController } from './controllers/transactionController';
import { WalletController } from './controllers/walletController';
import { BudgetController } from './controllers/budgetController';
import { AnalyticsController } from './controllers/analyticsController';
import { AIController } from './controllers/aiController';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(globalRateLimiter);

// Setup Swagger Docs
setupSwagger(app);

// Public Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: new Date().toISOString(), service: 'Vyora Enterprise API Engine' });
});

// Authentication Endpoints
app.post('/api/auth/register', authRateLimiter, AuthController.register);
app.post('/api/auth/verify-otp', authRateLimiter, AuthController.verifyOTP);
app.post('/api/auth/login', authRateLimiter, AuthController.login);
app.post('/api/auth/forgot-password', authRateLimiter, AuthController.requestPasswordReset);
app.post('/api/auth/reset-password', authRateLimiter, AuthController.resetPassword);

// Protected Routes (Require JWT)
app.use('/api', authenticateJWT);

// User Profile & Active Sessions
app.get('/api/auth/me', AuthController.getProfile);
app.get('/api/auth/sessions', AuthController.getActiveSessions);
app.delete('/api/auth/sessions/:id', AuthController.revokeSession);

// Transactions & Categories
app.get('/api/transactions', TransactionController.list);
app.post('/api/transactions', TransactionController.create);
app.delete('/api/transactions/:id', TransactionController.delete);
app.get('/api/categories', TransactionController.getCategories);

// Wallets & Accounts
app.get('/api/wallets', WalletController.list);
app.post('/api/wallets', WalletController.create);

// Budgets
app.get('/api/budgets', BudgetController.getMonthlyBudget);
app.post('/api/budgets', BudgetController.setBudget);

// Analytics
app.get('/api/analytics/dashboard', AnalyticsController.getDashboardOverview);
app.get('/api/analytics/cashflow', AnalyticsController.getCashFlowTrends);

// AI & Predictions
app.post('/api/ai/chat', AIController.chat);
app.get('/api/ai/predictions', AIController.getPredictions);

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
