'use client';

import { useState } from 'react';
import { Target, Plus } from 'lucide-react';

const GOALS_MOCK = [
  { id: '1', name: 'Emergency Fund Reserve', target: 500000, current: 325000, date: '2026-12-31', color: '#10B981' },
  { id: '2', name: 'New M3 MacBook Pro', target: 250000, current: 180000, date: '2026-10-15', color: '#3B82F6' },
  { id: '3', name: 'Ladakh Road Trip Fund', target: 120000, current: 75000, date: '2027-04-01', color: '#8B5CF6' },
];

export default function GoalsPage() {
  const [goals] = useState(GOALS_MOCK);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Savings & Wealth Goals</h1>
          <p className="text-xs text-slate-400 mt-1">Track progress towards financial milestones and automated savings allocations (₹).</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all">
          <Plus className="w-4 h-4" />
          <span>Create Savings Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((g) => {
          const percent = Math.round((g.current / g.target) * 100);
          return (
            <div key={g.id} className="glass-card glass-card-hover p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${g.color}20` }}>
                  <Target className="w-4 h-4" style={{ color: g.color }} />
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {percent}% Saved
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-white">{g.name}</h3>
                <p className="text-2xl font-bold text-white mt-1">₹{g.current.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/ ₹{g.target.toLocaleString('en-IN')}</span></p>
              </div>

              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: g.color }} />
              </div>

              <p className="text-[11px] text-slate-400">Target Date: {g.date}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
