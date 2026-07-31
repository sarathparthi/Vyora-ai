export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/backend';

export function getCurrentUserEmail(): string {
  if (typeof window === 'undefined') return '';
  try {
    const userStr = localStorage.getItem('vyora_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.email) return u.email;
    }
  } catch (e) {}
  return '';
}

export function getUserAccountStore(email: string) {
  if (typeof window === 'undefined' || !email) return null;
  const key = `vyora_account_data_${email.toLowerCase()}`;
  const existing = localStorage.getItem(key);

  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      // Clean legacy mock goals if present from old versions
      if (Array.isArray(parsed.goals)) {
        parsed.goals = parsed.goals.filter(
          (g: any) =>
            g.id !== '1' &&
            g.id !== '2' &&
            g.id !== '3' &&
            !['Emergency Fund Reserve', 'New M3 MacBook Pro', 'Ladakh Road Trip Fund'].includes(g.name)
        );
      }
      return parsed;
    } catch (e) {}
  }

  // BRAND NEW USER: Starts 100% clean & empty (Zero pre-filled items)
  const freshEmptyStore = {
    transactions: [],
    wallets: [],
    budgets: [],
    goals: [],
    monthlyBudgetCap: 0,
  };

  localStorage.setItem(key, JSON.stringify(freshEmptyStore));
  return freshEmptyStore;
}

export function saveUserAccountStore(email: string, storeData: any) {
  if (typeof window === 'undefined' || !email) return;
  const key = `vyora_account_data_${email.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify(storeData));
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
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
  const userStore = getUserAccountStore(currentEmail) || {
    transactions: [],
    wallets: [],
    budgets: [],
    goals: [],
    monthlyBudgetCap: 0,
  };

  const txs = userStore.transactions || [];
  const wallets = userStore.wallets || [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  // Month-filtered transactions
  const monthTxs = txs.filter((t: any) => {
    if (!t.date) return false;
    const d = new Date(t.date);
    return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
  });

  // Today's transactions
  const todayStr = now.toISOString().split('T')[0];
  const todayTxs = txs.filter((t: any) => t.date === todayStr);

  const todayExpense = todayTxs.filter((t: any) => t.type === 'EXPENSE').reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
  const todayIncome = todayTxs.filter((t: any) => t.type === 'INCOME').reduce((a: number, b: any) => a + Number(b.amount || 0), 0);

  const totalBalance = wallets.reduce((acc: number, w: any) => acc + Number(w.balance || 0), 0);
  const monthlyIncome = monthTxs.filter((t: any) => t.type === 'INCOME').reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
  const monthlyExpense = monthTxs.filter((t: any) => t.type === 'EXPENSE').reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpense);
  const budgetCap = Number(userStore.monthlyBudgetCap || 0);
  const budgetRemaining = Math.max(0, budgetCap - monthlyExpense);

  const dailyBudgetAllowance = budgetCap > 0 ? budgetCap / daysInMonth : 0;
  const dailyRemaining = Math.max(0, dailyBudgetAllowance - todayExpense);

  if (endpoint.includes('/analytics/dashboard')) {
    let topExpenseCategory = 'None';
    const catSums: Record<string, number> = {};
    monthTxs.filter((t: any) => t.type === 'EXPENSE').forEach((t: any) => {
      catSums[t.category] = (catSums[t.category] || 0) + Number(t.amount || 0);
    });

    let maxAmt = 0;
    Object.entries(catSums).forEach(([cat, amt]) => {
      if (amt > maxAmt) {
        maxAmt = amt;
        topExpenseCategory = cat;
      }
    });

    const hasData = monthTxs.length > 0;
    const healthScore = hasData
      ? {
          score: Math.min(100, Math.round((monthlySavings / (monthlyIncome || 1)) * 100)),
          grade: 'A',
          breakdown: { savingsRate: Math.round((monthlySavings / (monthlyIncome || 1)) * 100), budgetCompliance: 90, stabilityScore: 100 },
        }
      : { score: 0, grade: 'N/A', breakdown: { savingsRate: 0, budgetCompliance: 100, stabilityScore: 0 } };

    return {
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
        dailyBudgetAllowance,
        dailyRemaining,
        topExpenseCategory,
        healthScore,
        recentTransactions: monthTxs.slice(0, 5).map((t: any) => ({
          ...t,
          category: { name: t.category || 'General', color: '#3B82F6' },
          wallet: { name: t.wallet || 'Main Wallet' },
        })),
      },
    };
  }

  if (endpoint.includes('/analytics/cashflow')) {
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    return {
      success: true,
      data: months.map((m, i) => ({
        month: `${m} 2026`,
        income: i === 5 ? monthlyIncome : 0,
        expense: i === 5 ? monthlyExpense : 0,
        savings: i === 5 ? monthlySavings : 0,
      })),
    };
  }

  if (endpoint.includes('/ai/predictions')) {
    const hasData = monthTxs.length > 0;

    return {
      success: true,
      data: {
        targetMonth: currentMonth === 12 ? 1 : currentMonth + 1,
        targetYear: currentMonth === 12 ? currentYear + 1 : currentYear,
        predictedExpense: hasData ? Math.round(monthlyExpense * 1.05) : 0,
        predictedIncome: hasData ? monthlyIncome : 0,
        predictedSavings: hasData ? Math.max(0, monthlyIncome - monthlyExpense * 1.05) : 0,
        confidenceScore: hasData ? 0.92 : 0.0,
        expenseTrendDirection: 'STABLE',
        growthRatePercent: 0,
        recommendations: hasData
          ? ['Your monthly budget cap is active. Keep monitoring your daily spending allowance!']
          : ['No expense activity recorded for this month. Add your first transaction to get started.'],
        riskLevel: 'LOW',
      },
    };
  }

  if (endpoint.includes('/ai/chat')) {
    if (monthTxs.length === 0) {
      return {
        success: true,
        answer: `🤖 **Vyora AI Financial Assistant**:\n\nWelcome to your financial workspace! No expenses have been logged for this month.\n\n• **Action Required**: Add your bank accounts and record your daily spending to activate AI recommendations.`,
      };
    }

    return {
      success: true,
      answer: `🤖 **Vyora AI Financial Assistant**:\n\nAnalyzed your spending for this month:\n• **Monthly Spending**: ₹${monthlyExpense.toLocaleString('en-IN')}\n• **Monthly Retained Savings**: ₹${monthlySavings.toLocaleString('en-IN')}\n• **Daily Allowance Target**: ₹${dailyBudgetAllowance.toFixed(2)}/day`,
    };
  }

  return { success: true, data: [] };
}
