'use client';

import { useState } from 'react';
import { AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';

const CATEGORY_BUDGETS = [
  { id: '1', category: 'Rent & Housing', allocated: 35000, spent: 35000, color: '#EF4444' },
  { id: '2', category: 'Food & Dining', allocated: 15000, spent: 11450, color: '#F59E0B' },
  { id: '3', category: 'Groceries', allocated: 12000, spent: 8200, color: '#EC4899' },
  { id: '4', category: 'Fuel & Transport', allocated: 8000, spent: 5195, color: '#6366F1' },
  { id: '5', category: 'Subscriptions & Entertainment', allocated: 5000, spent: 3499, color: '#A855F7' },
  { id: '6', category: 'Shopping & Tech', allocated: 10000, spent: 6800, color: '#F97316' },
];

export default function BudgetsPage() {
  const [budgets] = useState(CATEGORY_BUDGETS);
  const totalAllocated = budgets.reduce((acc, b) => acc + b.allocated, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const percentUsed = Math.round((totalSpent / totalAllocated) * 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Monthly Budget Management</h1>
          <p className="text-xs text-slate-400 mt-1">Set category limits, monitor spending thresholds, and receive AI overspending alerts in Indian Rupees (₹).</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all">
          <Plus className="w-4 h-4" />
          <span>New Budget Cap</span>
        </button>
      </div>

      {/* Overall Budget Status */}
      <div className="glass-card p-6 rounded-2xl border-l-4 border-l-blue-500 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-300">July 2026 Master Budget</h2>
            <p className="text-2xl font-bold text-white mt-1">₹{totalSpent.toLocaleString('en-IN')} / ₹{totalAllocated.toLocaleString('en-IN')}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${percentUsed > 90 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
            {percentUsed}% Utilized
          </span>
        </div>

        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentUsed > 90 ? 'bg-rose-500' : percentUsed > 75 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            }`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Remaining: ₹{(totalAllocated - totalSpent).toLocaleString('en-IN')}</span>
          <span>Target Cap: ₹{totalAllocated.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {budgets.map((b) => {
          const catPercent = Math.round((b.spent / b.allocated) * 100);
          const isOver = catPercent >= 100;
          const isWarning = catPercent >= 80 && !isOver;

          return (
            <div key={b.id} className="glass-card glass-card-hover p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }} />
                  <h3 className="font-semibold text-sm text-white">{b.category}</h3>
                </div>
                {isOver ? (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                    <AlertTriangle className="w-3 h-3" /> Over Budget
                  </span>
                ) : isWarning ? (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                    <AlertTriangle className="w-3 h-3" /> Near Limit
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> On Track
                  </span>
                )}
              </div>

              <div className="flex justify-between text-xs text-slate-300">
                <span>Spent: ₹{b.spent.toLocaleString('en-IN')}</span>
                <span className="font-semibold text-slate-400">Cap: ₹{b.allocated.toLocaleString('en-IN')}</span>
              </div>

              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, catPercent)}%`,
                    backgroundColor: isOver ? '#EF4444' : isWarning ? '#F59E0B' : b.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
