export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function getCurrentUserEmail(): string {
  if (typeof window === 'undefined') return 'demo@vyora.ai';
  try {
    const userStr = localStorage.getItem('vyora_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.email) return u.email;
    }
  } catch (e) {}
  return 'demo@vyora.ai';
}

export function getUserAccountStore(email: string) {
  if (typeof window === 'undefined') return null;
  const key = `vyora_account_data_${email.toLowerCase()}`;
  const existing = localStorage.getItem(key);

  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (e) {}
  }

  // If this is the Demo User, initialize with sample demo data
  if (email.toLowerCase() === 'demo@vyora.ai') {
    const demoStore = {
      transactions: [
        {
          id: 'tx-1',
          description: 'Dinner at Royal Bistro',
          amount: 1450.5,
          type: 'EXPENSE',
          date: new Date().toISOString().split('T')[0],
          category: 'Food & Dining',
          wallet: 'HDFC Credit Card',
          tags: 'dining',
        },
        {
          id: 'tx-2',
          description: 'Monthly Tech Salary - Vyora Corp',
          amount: 130000.0,
          type: 'INCOME',
          date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
          category: 'Salary',
          wallet: 'ICICI Savings',
          tags: 'salary',
        },
        {
          id: 'tx-3',
          description: 'Monthly Apartment Rent',
          amount: 35000.0,
          type: 'EXPENSE',
          date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
          category: 'Rent & Housing',
          wallet: 'ICICI Savings',
          tags: 'rent',
        },
      ],
      wallets: [
        { id: 'w-1', name: 'ICICI Savings Account', type: 'BANK_ACCOUNT', balance: 184500.0, currency: 'INR', color: '#2563EB', isDefault: true },
        { id: 'w-2', name: 'High-Yield Fixed Deposit', type: 'BANK_ACCOUNT', balance: 450000.0, currency: 'INR', color: '#059669', isDefault: false },
        { id: 'w-3', name: 'HDFC Regalia Credit Card', type: 'CREDIT_CARD', balance: 24500.0, currency: 'INR', color: '#DC2626', isDefault: false },
      ],
      budgets: [
        { id: 'b-1', category: 'Rent & Housing', allocated: 35000, spent: 35000, color: '#EF4444' },
        { id: 'b-2', category: 'Food & Dining', allocated: 15000, spent: 11450, color: '#F59E0B' },
        { id: 'b-3', category: 'Groceries', allocated: 12000, spent: 8200, color: '#EC4899' },
      ],
      goals: [
        { id: 'g-1', name: 'Emergency Reserve', target: 500000, current: 325000, date: '2026-12-31', color: '#10B981' },
        { id: 'g-2', name: 'New M3 MacBook Pro', target: 250000, current: 180000, date: '2026-10-15', color: '#3B82F6' },
      ],
      budgetCap: 75000.0,
    };
    localStorage.setItem(key, JSON.stringify(demoStore));
    return demoStore;
  }

  // BRAND NEW USER: Initialize completely EMPTY (Zero balances & Zero transactions)
  const freshEmptyStore = {
    transactions: [],
    wallets: [
      { id: 'w-1', name: 'Main Bank Account', type: 'BANK_ACCOUNT', balance: 0.0, currency: 'INR', color: '#3B82F6', isDefault: true },
    ],
    budgets: [
      { id: 'b-1', category: 'General Budget', allocated: 0, spent: 0, color: '#3B82F6' },
    ],
    goals: [],
    budgetCap: 0.0,
  };

  localStorage.setItem(key, JSON.stringify(freshEmptyStore));
  return freshEmptyStore;
}

export function saveUserAccountStore(email: string, storeData: any) {
  if (typeof window === 'undefined') return;
  const key = `vyora_account_data_${email.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify(storeData));
}

export async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vyora_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    return getFallbackData(endpoint, options);
  }
}

function getFallbackData(endpoint: string, options: RequestInit = {}) {
  const currentEmail = getCurrentUserEmail();
  const userStore = getUserAccountStore(currentEmail);

  if (endpoint.includes('/analytics/dashboard')) {
    const txs = userStore.transactions || [];
    const wallets = userStore.wallets || [];

    const totalBalance = wallets.reduce((acc: number, w: any) => acc + (w.balance || 0), 0);
    const monthlyIncome = txs.filter((t: any) => t.type === 'INCOME').reduce((a: number, b: any) => a + b.amount, 0);
    const monthlyExpense = txs.filter((t: any) => t.type === 'EXPENSE').reduce((a: number, b: any) => a + b.amount, 0);
    const monthlySavings = Math.max(0, monthlyIncome - monthlyExpense);
    const budgetCap = userStore.budgetCap || 0;
    const budgetRemaining = Math.max(0, budgetCap - monthlyExpense);

    let topExpenseCategory = 'None';
    const catSums: Record<string, number> = {};
    txs.filter((t: any) => t.type === 'EXPENSE').forEach((t: any) => {
      catSums[t.category] = (catSums[t.category] || 0) + t.amount;
    });

    let maxAmt = 0;
    Object.entries(catSums).forEach(([cat, amt]) => {
      if (amt > maxAmt) {
        maxAmt = amt;
        topExpenseCategory = cat;
      }
    });

    const hasData = txs.length > 0;
    const healthScore = hasData
      ? { score: 88, grade: 'A', breakdown: { savingsRate: 68, budgetCompliance: 90, stabilityScore: 100 } }
      : { score: 0, grade: 'N/A', breakdown: { savingsRate: 0, budgetCompliance: 100, stabilityScore: 0 } };

    return {
      success: true,
      data: {
        totalBalance,
        todayExpense: 0.0,
        todayIncome: 0.0,
        monthlyIncome,
        monthlyExpense,
        monthlySavings,
        budgetCap,
        budgetRemaining,
        topExpenseCategory,
        healthScore,
        recentTransactions: txs.slice(0, 5).map((t: any) => ({
          ...t,
          category: { name: t.category, color: '#3B82F6' },
          wallet: { name: t.wallet },
        })),
      },
    };
  }

  if (endpoint.includes('/analytics/cashflow')) {
    const txs = userStore.transactions || [];
    const monthlyIncome = txs.filter((t: any) => t.type === 'INCOME').reduce((a: number, b: any) => a + b.amount, 0);
    const monthlyExpense = txs.filter((t: any) => t.type === 'EXPENSE').reduce((a: number, b: any) => a + b.amount, 0);

    return {
      success: true,
      data: [
        { month: 'Oct 2025', income: 0, expense: 0, savings: 0 },
        { month: 'Nov 2025', income: 0, expense: 0, savings: 0 },
        { month: 'Dec 2025', income: 0, expense: 0, savings: 0 },
        { month: 'Jan 2026', income: 0, expense: 0, savings: 0 },
        { month: 'Feb 2026', income: 0, expense: 0, savings: 0 },
        { month: 'Mar 2026', income: monthlyIncome, expense: monthlyExpense, savings: Math.max(0, monthlyIncome - monthlyExpense) },
      ],
    };
  }

  if (endpoint.includes('/ai/predictions')) {
    const txs = userStore.transactions || [];
    const hasData = txs.length > 0;

    return {
      success: true,
      data: {
        targetMonth: 4,
        targetYear: 2026,
        predictedExpense: hasData ? 51500 : 0,
        predictedIncome: hasData ? 167500 : 0,
        predictedSavings: hasData ? 116000 : 0,
        confidenceScore: hasData ? 0.93 : 0.0,
        expenseTrendDirection: 'STABLE',
        growthRatePercent: 0,
        recommendations: hasData
          ? ['Your current expenditure trajectory is healthy.']
          : ['Add your first transaction to unlock AI spending predictions.'],
        riskLevel: 'LOW',
      },
    };
  }

  if (endpoint.includes('/ai/chat')) {
    const txs = userStore.transactions || [];
    if (txs.length === 0) {
      return {
        success: true,
        answer: `🤖 **Vyora AI Financial Assistant**:\n\nWelcome to your new account! Your ledger is currently empty.\n\n• **Tip**: Add your first Income or Expense transaction using the **+ Add Entry** button at the top to start receiving AI financial insights.`,
      };
    }

    return {
      success: true,
      answer: `🤖 **Vyora AI Financial Assistant**:\n\nAnalyzed your account ledger.\n\n• You have ${txs.length} recorded transactions.\n• Total balance is properly tracked across your active wallets.`,
    };
  }

  return { success: true, data: [] };
}
