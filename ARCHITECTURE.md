# Vyora System Architecture & Technical Specifications

> **AI Personal Finance & Budget Management SaaS Platform**

---

## 🏛️ System Architecture Overview

Vyora adheres to **Clean Architecture**, **Domain-Driven Design (DDD)**, and the **Repository Pattern**. It decouples UI presentation, business domain logic, database ORM abstractions, and external AI integrations.

```
                  +-----------------------------------+
                  |   Next.js 15 / React 19 Client    |
                  |  (Tailwind, Framer Motion, Recharts)|
                  +-----------------+-----------------+
                                    |
                                    | HTTPS / REST / JWT
                                    v
                  +-----------------+-----------------+
                  |    Express / Node.js API Server   |
                  |  (Auth, RBAC, Helmet, RateLimiter) |
                  +--------+----------------+---------+
                           |                |
            +--------------+                +------------------+
            |                                                  |
            v                                                  v
+-----------+------------+                          +----------+----------+
|  Statistical Prediction|                          |  Google Gemini API   |
| Engine (Linear Reg, EMA) |                          | (Conversational AI) |
+-----------+------------+                          +----------+----------+
            |                                                  |
            +-----------------------+--------------------------+
                                    |
                                    v
                       +------------+------------+
                       |    Prisma ORM Layer     |
                       +------------+------------+
                                    |
                                    v
                       +------------+------------+
                       |    PostgreSQL Database  |
                       +-------------------------+
```

---

## 🗄️ Relational Data Domain Model

1. **User Management**: `User`, `Role` (ADMIN, MANAGER, USER, GUEST), `UserSession`, `RefreshToken`, `AuditLog`.
2. **Account & Wallets**: `Wallet` (BANK_ACCOUNT, CREDIT_CARD, CASH_WALLET, INVESTMENT) with real-time balance sync.
3. **Transaction Ledger**: `Transaction` (INCOME, EXPENSE, TRANSFER) linked with `Category` & `Subcategory`, recurring schedules, and tags.
4. **Budgeting Engine**: `Budget` (Monthly total cap with alert percentages), `BudgetCategory` allocations.
5. **Wealth Goals**: `SavingsGoal` (Target milestones, deadlines, color coding).
6. **AI Intelligence**: `AIPrediction` (Stored forecast records), `AIInsight` (Anomaly detection & recommendations).

---

## 🤖 AI & Prediction Engine Specification

### 1. Statistical Forecast Engine (`PredictionEngine`)
- **Simple Moving Average (SMA)**: Computes 3-month baseline expenditure velocity.
- **Linear Regression**: Calculates slope \(m\) and intercept \(c\) via least-squares estimation to project month \(X+1\) trajectory.
- **Ensemble Model**: 60% Linear Regression + 40% SMA weighting to balance momentum and baseline.

### 2. Gemini Financial Advisor (`GeminiAIService`)
- Powered by Google Gen AI SDK (`@google/genai`).
- Generates natural language analysis answering queries such as:
  - *"Why did I spend more this month?"*
  - *"What can I reduce to save $10,000?"*
- Computes **Financial Health Score (0-100)** incorporating savings rate, budget compliance, and liquidity reserves.
