'use client';

import { useEffect, useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Zap,
  Plus,
  Bot,
  AlertCircle
} from 'lucide-react';
import { getCurrentUserEmail, getUserAccountStore, saveUserAccountStore, getDaysInMonth } from '@/lib/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Dashboard() {
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  
  // Calendar Month & Year State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Dynamic Financial Metrics
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAccountData = () => {
    const email = getCurrentUserEmail();
    setUserEmail(email);
    const storedUser = localStorage.getItem('vyora_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.name) setUserName(u.name);
      } catch (e) {}
    }

    const store = getUserAccountStore(email);
    setStoreData(store);
    setLoading(false);
  };

  useEffect(() => {
    loadAccountData();
  }, [selectedMonth, selectedYear]);

  if (loading || !storeData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter transactions by selected Month & Year
  const allTxs = storeData.transactions || [];
  const monthTxs = allTxs.filter((t: any) => {
    if (!t.date) return false;
    const d = new Date(t.date);
    return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
  });

  // Calculate Today's Spending
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const todayTxs = allTxs.filter((t: any) => t.date === todayStr);

  const todayExpense = todayTxs.filter((t: any) => t.type === 'EXPENSE').reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
  const todayIncome = todayTxs.filter((t: any) => t.type === 'INCOME').reduce((a: number, b: any) => a + Number(b.amount || 0), 0);

  // Calculate Monthly Totals
  const monthlyIncome = monthTxs.filter((t: any) => t.type === 'INCOME').reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
  const monthlyExpense = monthTxs.filter((t: any) => t.type === 'EXPENSE').reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpense);

  const wallets = storeData.wallets || [];
  const totalBalance = wallets.reduce((acc: number, w: any) => acc + Number(w.balance || 0), 0);

  const monthlyBudgetCap = Number(storeData.monthlyBudgetCap || 0);
  const budgetRemaining = Math.max(0, monthlyBudgetCap - monthlyExpense);

  // Daily Budget Monitor Calculations
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const dailyBudgetAllowance = monthlyBudgetCap > 0 ? monthlyBudgetCap / daysInMonth : 0;
  const dailyRemaining = Math.max(0, dailyBudgetAllowance - todayExpense);
  const dailyPercentUsed = dailyBudgetAllowance > 0 ? Math.min(100, Math.round((todayExpense / dailyBudgetAllowance) * 100)) : 0;

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Calendar Day Spending Map for Monthly Grid
  const daysMap: Record<number, number> = {};
  monthTxs.forEach((t: any) => {
    if (t.type === 'EXPENSE' && t.date) {
      const dayNum = new Date(t.date).getDate();
      daysMap[dayNum] = (daysMap[dayNum] || 0) + Number(t.amount || 0);
    }
  });

  return (
    <div className="space-y-8">
      {/* Top Header & Calendar Month Navigator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time daily budget monitor & monthly financial ledger in Indian Rupees (₹).
          </p>
        </div>

        {/* Month & Year Calendar Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-lg">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 text-xs font-bold text-white min-w-[130px] justify-center">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <a
            href="/ai-advisor"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-all"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Consult AI</span>
          </a>
        </div>
      </div>

      {/* Metrics Row 1: Key Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Net Balance */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Net Balance</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            <p className="text-[11px] text-slate-400 mt-1">Across {wallets.length} active wallets</p>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{MONTH_NAMES[selectedMonth - 1]} Income</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">₹{monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">Today: +₹{todayIncome.toFixed(2)}</p>
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{MONTH_NAMES[selectedMonth - 1]} Expense</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">₹{monthlyExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            <p className="text-[11px] text-rose-400 font-semibold mt-1">Today: -₹{todayExpense.toFixed(2)}</p>
          </div>
        </div>

        {/* Net Retained Savings */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Retained Savings</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0}% Saved
            </span>
          </div>
          <div className="mt-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">₹{monthlySavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Net income retained after expenses</p>
        </div>
      </div>

      {/* Row 2: Daily Budget Monitor & Monthly Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Budget Monitor Card */}
        <div className="glass-card p-6 rounded-2xl space-y-5 border-l-4 border-l-blue-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Daily Budget Monitor</span>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
              {daysInMonth} Days in Month
            </span>
          </div>

          <div className="space-y-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400 font-medium">Daily Spending Cap</span>
              <span className="text-sm font-bold text-white">₹{dailyBudgetAllowance.toFixed(2)} <span className="text-[10px] text-slate-500">/day</span></span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400 font-medium">Today's Expense</span>
              <span className={`text-sm font-bold ${todayExpense > dailyBudgetAllowance && dailyBudgetAllowance > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                ₹{todayExpense.toFixed(2)}
              </span>
            </div>

            {/* Daily Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    dailyPercentUsed > 100 ? 'bg-rose-500' : dailyPercentUsed > 85 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, dailyPercentUsed)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Remaining Daily Allowance:</span>
                <span className="font-semibold text-emerald-400">₹{dailyRemaining.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {monthlyBudgetCap === 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Set a Monthly Budget Cap under <b>Budgets</b> to activate daily monitoring!</span>
            </div>
          )}

          <a
            href="/budgets"
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            <span>Manage Monthly Budget Cap</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Monthly Calendar Daily Heatmap Grid (31 Days) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-400" />
                <span>{MONTH_NAMES[selectedMonth - 1]} Calendar Spending Tracker</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily expense monitoring for each day of the month</p>
            </div>
            <a href="/transactions" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <span>View Transactions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-2 pt-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-1">
                {d}
              </div>
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const spentOnDay = daysMap[day] || 0;
              const isToday = day === now.getDate() && selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();

              return (
                <div
                  key={day}
                  className={`p-2 rounded-xl border flex flex-col justify-between items-center h-16 transition-all ${
                    isToday
                      ? 'border-blue-500 bg-blue-500/10'
                      : spentOnDay > 0
                      ? 'border-rose-500/30 bg-rose-500/10'
                      : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/40'
                  }`}
                >
                  <span className={`text-xs font-semibold ${isToday ? 'text-blue-400 font-bold' : 'text-slate-300'}`}>
                    {day}
                  </span>
                  {spentOnDay > 0 ? (
                    <span className="text-[10px] font-bold text-rose-400 truncate max-w-full">
                      -₹{spentOnDay > 999 ? `${(spentOnDay / 1000).toFixed(1)}k` : spentOnDay}
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-600">-</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Transactions & Zero State handling */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base text-white">Recent Transactions ({MONTH_NAMES[selectedMonth - 1]})</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time entries logged for this month</p>
          </div>
          <a href="/transactions" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {monthTxs.length === 0 ? (
          <div className="p-8 text-center space-y-3 bg-slate-900/40 rounded-xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
              <Plus className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">No Transactions Logged for {MONTH_NAMES[selectedMonth - 1]}</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your daily income or expense entries to monitor your budget and cash flow.
            </p>
            <a
              href="/transactions"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transaction Entry</span>
            </a>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {monthTxs.slice(0, 5).map((tx: any) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {tx.type === 'INCOME' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{tx.description}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {tx.category || 'General'} • {tx.wallet || 'Main Wallet'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-xs font-bold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{tx.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
