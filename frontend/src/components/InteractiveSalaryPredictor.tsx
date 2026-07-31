'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieIcon,
  Sliders,
  DollarSign,
  ArrowRight,
  Zap,
  Check,
} from 'lucide-react';
import { getCurrentUserEmail, getUserAccountStore, saveUserAccountStore, getDaysInMonth } from '@/lib/api';

interface CategoryAllocation {
  id: string;
  name: string;
  icon: string;
  percent: number;
  color: string;
  description: string;
}

const PRESET_RULES = [
  {
    id: '50-30-20',
    label: '50/30/20 Standard Rule',
    desc: '50% Essential Needs, 30% Wants, 20% Wealth Savings',
    allocations: { housing: 30, groceries: 15, transport: 5, utilities: 5, lifestyle: 25, savings: 20 },
  },
  {
    id: '40-20-40',
    label: '40/20/40 Aggressive Saver',
    desc: '40% Essential Needs, 20% Lifestyle, 40% High Savings',
    allocations: { housing: 25, groceries: 10, transport: 5, utilities: 4, lifestyle: 16, savings: 40 },
  },
  {
    id: '60-15-25',
    label: '60/15/25 Frugal Protection',
    desc: '60% Essential Needs, 15% Wants, 25% Emergency Reserve',
    allocations: { housing: 35, groceries: 15, transport: 6, utilities: 4, lifestyle: 15, savings: 25 },
  },
];

const DEFAULT_CATEGORIES: CategoryAllocation[] = [
  { id: 'housing', name: 'Rent & Housing', icon: '🏠', percent: 30, color: '#EF4444', description: 'Rent, maintenance, home repairs' },
  { id: 'groceries', name: 'Groceries & Dining', icon: '🛒', percent: 15, color: '#F59E0B', description: 'Food supplies, dining out, daily snacks' },
  { id: 'transport', name: 'Transport & Fuel', icon: '🚗', percent: 8, color: '#6366F1', description: 'Commute, gas, vehicle upkeep' },
  { id: 'utilities', name: 'Utilities & Bills', icon: '⚡', percent: 7, color: '#06B6D4', description: 'Electricity, internet, subscriptions' },
  { id: 'lifestyle', name: 'Shopping & Entertainment', icon: '🛍️', percent: 15, color: '#EC4899', description: 'Tech, apparel, outings, hobbies' },
  { id: 'savings', name: 'Wealth & Emergency Reserve', icon: '📈', percent: 25, color: '#10B981', description: 'High-yield savings, investments, mutual funds' },
];

export default function InteractiveSalaryPredictor() {
  const [monthlySalary, setMonthlySalary] = useState<number>(0);
  const [selectedRule, setSelectedRule] = useState<string>('50-30-20');
  const [categories, setCategories] = useState<CategoryAllocation[]>(DEFAULT_CATEGORIES);
  const [appliedMessage, setAppliedMessage] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const email = getCurrentUserEmail();
    setUserEmail(email);
    const store = getUserAccountStore(email);
    if (store) {
      const txs = store.transactions || [];
      const totalIncome = txs
        .filter((t: any) => t.type === 'INCOME')
        .reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);

      if (totalIncome > 0) {
        setMonthlySalary(Math.round(totalIncome));
      } else if (store.monthlyBudgetCap && Number(store.monthlyBudgetCap) > 0) {
        setMonthlySalary(Math.round(Number(store.monthlyBudgetCap) * 1.25));
      } else {
        setMonthlySalary(0);
      }
    }
  }, []);

  const handleSalaryPreset = (amount: number) => {
    setMonthlySalary(amount);
  };

  const handleRuleChange = (ruleId: string) => {
    setSelectedRule(ruleId);
    const found = PRESET_RULES.find((r) => r.id === ruleId);
    if (found) {
      setCategories((prev) =>
        prev.map((c) => ({
          ...c,
          percent: (found.allocations as any)[c.id] ?? c.percent,
        }))
      );
    }
  };

  const handleCategoryPercentChange = (id: string, newPercent: number) => {
    setSelectedRule('custom');
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, percent: Math.max(0, Math.min(100, newPercent)) } : c))
    );
  };

  const totalPercent = categories.reduce((acc, c) => acc + c.percent, 0);

  // Calculations
  const nonSavingsCategories = categories.filter((c) => c.id !== 'savings');
  const savingsCategory = categories.find((c) => c.id === 'savings');

  const predictedExpensePercent = nonSavingsCategories.reduce((acc, c) => acc + c.percent, 0);
  const totalPredictedExpense = Math.round((monthlySalary * predictedExpensePercent) / 100);

  const predictedSavingsPercent = savingsCategory ? savingsCategory.percent : Math.max(0, 100 - predictedExpensePercent);
  const totalPredictedSavings = Math.round((monthlySalary * predictedSavingsPercent) / 100);

  const daysInMonth = getDaysInMonth(new Date().getFullYear(), new Date().getMonth() + 1);
  const dailyPredictedAllowance = totalPredictedExpense > 0 ? totalPredictedExpense / daysInMonth : 0;

  // Risk Assessment
  let riskStatus: 'HEALTHY' | 'MODERATE' | 'CRITICAL' = 'HEALTHY';
  let riskColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  let riskLabel = 'Optimal Financial Allocation';

  if (monthlySalary > 0) {
    if (totalPercent > 100 || predictedExpensePercent > 85) {
      riskStatus = 'CRITICAL';
      riskColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      riskLabel = 'High Financial Over-commitment';
    } else if (predictedExpensePercent > 70) {
      riskStatus = 'MODERATE';
      riskColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      riskLabel = 'Moderate Expense Velocity';
    }
  } else {
    riskLabel = 'Awaiting Salary Input';
    riskColor = 'text-slate-400 bg-slate-800 border-slate-700';
  }

  // Apply Predicted Budget Caps to user account store
  const handleApplyToAccount = () => {
    if (!userEmail || monthlySalary <= 0) return;
    const store = getUserAccountStore(userEmail) || {};

    // 1. Update master monthly budget cap
    store.monthlyBudgetCap = totalPredictedExpense;

    // 2. Map predicted category amounts to category budget caps
    const newBudgets = nonSavingsCategories.map((c) => ({
      id: `b-${c.id}`,
      category: c.name,
      allocated: Math.round((monthlySalary * c.percent) / 100),
      spent: 0,
      color: c.color,
    }));

    store.budgets = newBudgets;
    saveUserAccountStore(userEmail, store);

    setAppliedMessage(
      `Applied! Master Monthly Budget Cap set to ₹${totalPredictedExpense.toLocaleString(
        'en-IN'
      )} with ${newBudgets.length} predicted category caps.`
    );
    setTimeout(() => setAppliedMessage(''), 4000);
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl space-y-8 border border-slate-800 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20 border border-white/10">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              AI Monthly Salary &amp; Expense Prediction Studio <Sparkles className="w-4 h-4 text-purple-400" />
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate monthly salary scenarios, predict categorized spending velocity, and set AI-driven budget limits.
            </p>
          </div>
        </div>

        <div className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${riskColor}`}>
          {riskStatus === 'CRITICAL' ? (
            <AlertTriangle className="w-4 h-4" />
          ) : riskStatus === 'MODERATE' ? (
            <Zap className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <span>{riskLabel}</span>
        </div>
      </div>

      {appliedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{appliedMessage}</span>
        </div>
      )}

      {/* Inputs Section: Monthly Salary & Preset Strategy Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Salary Input */}
        <div className="lg:col-span-1 glass-card p-5 rounded-2xl space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-400" /> Monthly Net Salary (₹)
            </label>
            <span className="text-[10px] text-slate-400 font-mono">Input Salary</span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
            <input
              type="number"
              step="1000"
              min="0"
              value={monthlySalary || ''}
              onChange={(e) => setMonthlySalary(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-purple-500 transition-all font-mono"
              placeholder="0"
            />
          </div>

          {/* Quick Preset Salary Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Quick Salary Select:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[30000, 50000, 75000, 100000, 150000, 200000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSalaryPreset(amt)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                    monthlySalary === amt
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  ₹{(amt / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Strategy Presets */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl space-y-3 border border-slate-800">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-purple-400" /> AI Budget Allocation Strategy
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESET_RULES.map((rule) => {
              const active = selectedRule === rule.id;
              return (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => handleRuleChange(rule.id)}
                  className={`p-3.5 rounded-xl text-left border transition-all space-y-1.5 ${
                    active
                      ? 'bg-purple-600/15 border-purple-500 text-white shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{rule.label}</span>
                    {active && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">{rule.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Real-Time Prediction Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Salary */}
        <div className="glass-card p-5 rounded-2xl space-y-1.5 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Monthly Salary</span>
          <p className="text-2xl font-extrabold text-white">₹{monthlySalary.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-slate-500">Base Income Benchmark</span>
        </div>

        {/* Total Predicted Expense */}
        <div className="glass-card p-5 rounded-2xl space-y-1.5 border border-slate-800 border-l-4 border-l-rose-500">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Predicted Expenses</span>
          <p className="text-2xl font-extrabold text-rose-400">₹{totalPredictedExpense.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-slate-400 font-medium">
            {predictedExpensePercent}% of salary • ₹{dailyPredictedAllowance.toFixed(0)}/day
          </span>
        </div>

        {/* Total Predicted Savings */}
        <div className="glass-card p-5 rounded-2xl space-y-1.5 border border-slate-800 border-l-4 border-l-emerald-500">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Predicted Savings</span>
          <p className="text-2xl font-extrabold text-emerald-400">₹{totalPredictedSavings.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-emerald-500/90 font-medium">
            {predictedSavingsPercent}% Savings Ratio
          </span>
        </div>

        {/* Daily Allowance */}
        <div className="glass-card p-5 rounded-2xl space-y-1.5 border border-slate-800 border-l-4 border-l-blue-500">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Predicted Daily Cap</span>
          <p className="text-2xl font-extrabold text-blue-400">₹{dailyPredictedAllowance.toFixed(2)}</p>
          <span className="text-[10px] text-slate-400">Across {daysInMonth} days this month</span>
        </div>
      </div>

      {/* Visual Stacked Allocation Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-white">Monthly Salary Allocation Breakdown</span>
          <span className={`font-mono font-bold ${totalPercent === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
            Total Allocated: {totalPercent}% {totalPercent !== 100 && `(${totalPercent > 100 ? '+' : ''}${totalPercent - 100}%)`}
          </span>
        </div>

        <div className="w-full h-4 rounded-full bg-slate-900 overflow-hidden flex p-0.5 border border-slate-800">
          {categories.map((c) => (
            <div
              key={c.id}
              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full relative group cursor-pointer"
              style={{ width: `${c.percent}%`, backgroundColor: c.color }}
              title={`${c.name}: ${c.percent}% (₹${Math.round((monthlySalary * c.percent) / 100).toLocaleString('en-IN')})`}
            />
          ))}
        </div>
      </div>

      {/* Category Sliders & Categorized Expense Breakdown Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-400" /> Categorized Expense &amp; Allocation Sliders
          </h3>
          <span className="text-xs text-slate-400">Adjust percentages to recalibrate prediction</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const calculatedAmount = Math.round((monthlySalary * cat.percent) / 100);
            const dailyCap = Math.round(calculatedAmount / daysInMonth);

            return (
              <div
                key={cat.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{cat.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{cat.name}</h4>
                      <p className="text-[10px] text-slate-400">{cat.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white">₹{calculatedAmount.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">₹{dailyCap}/day</span>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Allocation</span>
                    <span className="font-bold text-white font-mono">{cat.percent}%</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="1"
                    value={cat.percent}
                    onChange={(e) => handleCategoryPercentChange(cat.id, parseInt(e.target.value) || 0)}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <div className="text-xs text-slate-400">
          💡 <span className="text-slate-300 font-semibold">Tip</span>: Click below to sync these predicted category caps directly to your active budget ledger.
        </div>

        <button
          type="button"
          onClick={handleApplyToAccount}
          disabled={monthlySalary <= 0}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Apply AI Prediction to My Monthly Budget</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
