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
  Bot
} from 'lucide-react';
import { fetchFromAPI } from '@/lib/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [cashFlow, setCashFlow] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Alex Vance');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const storedUser = localStorage.getItem('vyora_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u.name) setUserName(u.name);
        }

        const [dashRes, flowRes] = await Promise.all([
          fetchFromAPI('/analytics/dashboard'),
          fetchFromAPI('/analytics/cashflow'),
        ]);
        if (dashRes.success) setData(dashRes.data);
        if (flowRes.success) setCashFlow(flowRes.data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const {
    totalBalance = 249500,
    todayExpense = 1450.5,
    todayIncome = 0,
    monthlyIncome = 166000,
    monthlyExpense = 52090.0,
    monthlySavings = 113910.0,
    budgetCap = 75000,
    budgetRemaining = 22910.0,
    healthScore = { score: 88, grade: 'A' },
    recentTransactions = [],
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Here is your real-time financial intelligence overview & AI forecast in Indian Rupees (₹).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/ai-advisor"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-all"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Consult Gemini AI</span>
          </a>
        </div>
      </div>

      {/* Metrics Row 1: Key Financial Indicators */}
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
            <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12.4% vs last month
            </p>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Monthly Income</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">₹{monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            <p className="text-[11px] text-slate-400 mt-1">Today: +₹{todayIncome.toFixed(2)}</p>
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Monthly Expense</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">₹{monthlyExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            <p className="text-[11px] text-slate-400 mt-1">Today: -₹{todayExpense.toFixed(2)}</p>
          </div>
        </div>

        {/* Financial Health Score Gauge */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl border-l-4 border-l-blue-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Health Index</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Grade {healthScore.grade}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white">{healthScore.score}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${healthScore.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Cash Flow Chart & AI Insights Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Interactive Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                Cash Flow Trend (Income vs Expense)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Historical 6-month financial trajectory in Indian Rupees (₹)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Income
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expense
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlow} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gemini AI Insights Widget */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Gemini AI Insights</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Live Analysis
            </span>
          </div>

          <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold text-white">Targeted Savings Forecast</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your retained savings rate is at **68%** this month. Moving ₹50,000 into your High-Yield Fixed Deposit will yield an estimated **+₹3,600/yr** in risk-free interest.
            </p>
          </div>

          {/* Budget Limit Tracker */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Monthly Budget Cap</span>
              <span className="text-white font-semibold">₹{monthlyExpense.toFixed(0)} / ₹{budgetCap.toFixed(0)}</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                style={{ width: `${Math.min(100, (monthlyExpense / budgetCap) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-right">
              ₹{budgetRemaining.toFixed(2)} remaining cap
            </p>
          </div>

          <a
            href="/ai-advisor"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all"
          >
            <span>Ask Gemini AI Question</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest real-time ledger entries in ₹</p>
          </div>
          <a href="/transactions" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="divide-y divide-slate-800/60">
          {recentTransactions.map((tx: any) => (
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
                    {tx.category?.name || 'Category'} • {tx.wallet?.name || 'Account'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-xs font-bold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
