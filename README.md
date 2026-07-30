# Vyora — AI Personal Finance & Budget Management Platform

> **Your AI Financial Intelligence Platform**  
> Vyora is an enterprise-ready, production-grade SaaS platform for personal financial management, expense tracking, multi-account wallet management, Gemini AI insights, and predictive spending analytics.

---

## 🌟 Key Features

- 📊 **Dynamic Financial Dashboard**: Real-time balance, spending trends, monthly budget utilization, cash flow metrics, and a Financial Health Score (0-100).
- 🤖 **Gemini AI Integration**: Conversational AI assistant for spending analysis, personalized savings recommendations, anomaly detection, and natural language financial queries.
- 📈 **Predictive Analytics Engine**: Machine learning algorithms (Simple Linear Regression, Moving Averages, Seasonality adjustments) forecasting future spending, budget caps, and savings capacity.
- 💳 **Multi-Account & Wallet Management**: Bank accounts, Cash, Credit Cards, Investments, and Currency support.
- 💸 **Income & Expense Tracking**: Categorization, subcategories, recurring transactions, notes, tags, receipt attachments, search, and bulk export (CSV, JSON).
- 🎯 **Smart Budgeting & Savings Goals**: Category budget limits, overspending alerts, weekly/monthly budget comparison, and milestone-tracked savings goals.
- 🔒 **Enterprise-Grade Security**: Argon2 password hashing, JWT Access & Refresh tokens, RBAC (Admin, Manager, User, Guest), Helmet, CORS, Rate Limiting, Audit Logging.
- 🐳 **Docker & Production Ready**: Docker Compose setup for PostgreSQL, Redis, Backend API, and Next.js Frontend with Swagger API documentation.

---

## 🏗️ Architecture

```
vyora/
├── backend/                  # Node.js & TypeScript API Server
│   ├── prisma/               # Database Schema, Migrations & Seeds
│   │   ├── schema.prisma     # Relational Database Model
│   │   └── seed.ts           # Comprehensive Demo Financial Data
│   ├── src/
│   │   ├── controllers/      # REST API Route Handlers
│   │   ├── services/         # Business Logic, AI Engine & Math Predictions
│   │   ├── middleware/       # Auth JWT, RBAC, Rate Limiter, Audit Logger
│   │   ├── config/           # Environment & Security Configuration
│   │   └── index.ts          # Server Entrypoint & Swagger UI Setup
│   └── tests/                # Automated API & Math Engine Unit Tests
├── frontend/                 # Next.js 15 & React 19 Modern Dashboard
│   ├── src/
│   │   ├── app/              # App Router Pages (Dashboard, Transactions, AI Advisor...)
│   │   ├── components/       # UI Components, Charts, Modals, Navbar, Sidebar
│   │   ├── lib/              # API Client, State Stores (Zustand), Utilities
│   │   └── types/            # TypeScript Interface Definitions
├── docker-compose.yml        # Orchestration for Postgres, Backend & Frontend
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ & npm
- PostgreSQL (or run via Docker Compose)

### 1. Backend Setup

```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```

The backend server runs at `http://localhost:5000`  
Swagger API Docs available at `http://localhost:5000/api/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application runs at `http://localhost:3000`

---

## 🐳 Docker Deployment

```bash
docker-compose up --build -d
```

Access:
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Swagger Docs: `http://localhost:5000/api/docs`

---

## 🔒 Security Checklist

- [x] Argon2id Password Hashing
- [x] JWT Token Rotation & HttpOnly Refresh Strategy
- [x] Role-Based Access Control (Admin / Manager / User / Guest)
- [x] Express Rate Limiting & Helmet HTTP Security Headers
- [x] SQL Injection & XSS Sanitization
- [x] Audit Logging for Security Events
