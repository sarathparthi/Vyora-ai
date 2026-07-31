'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, Trash2, X, Check } from 'lucide-react';
import { getCurrentUserEmail, getUserAccountStore, saveUserAccountStore } from '@/lib/api';

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  date: string;
  color: string;
}

const GOAL_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#EF4444', '#EC4899', '#F97316', '#06B6D4',
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', target: '', current: '', date: '', color: GOAL_COLORS[0] });
  const [formError, setFormError] = useState('');
  const [email, setEmail] = useState('');

  // Load goals from user's localStorage store
  useEffect(() => {
    const userEmail = getCurrentUserEmail();
    setEmail(userEmail);
    const store = getUserAccountStore(userEmail);
    setGoals(store?.goals || []);
  }, []);

  const saveGoals = (updated: Goal[]) => {
    setGoals(updated);
    const store = getUserAccountStore(email) || {};
    saveUserAccountStore(email, { ...store, goals: updated });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) { setFormError('Goal name is required.'); return; }
    if (!form.target || Number(form.target) <= 0) { setFormError('Target amount must be greater than 0.'); return; }
    if (Number(form.current) < 0) { setFormError('Current savings cannot be negative.'); return; }
    if (Number(form.current) > Number(form.target)) { setFormError('Current savings cannot exceed target amount.'); return; }
    if (!form.date) { setFormError('Target date is required.'); return; }

    const newGoal: Goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: form.name.trim(),
      target: Number(form.target),
      current: Number(form.current) || 0,
      date: form.date,
      color: form.color,
    };

    saveGoals([...goals, newGoal]);
    setForm({ name: '', target: '', current: '', date: '', color: GOAL_COLORS[0] });
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    saveGoals(goals.filter((g) => g.id !== id));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Savings &amp; Wealth Goals</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track progress towards your financial milestones (₹).
          </p>
        </div>
        <button
          onClick={() => { setFormError(''); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Savings Goal</span>
        </button>
      </div>

      {/* Empty state */}
      {goals.length === 0 && (
        <div className="glass-card p-12 rounded-2xl flex flex-col items-center justify-center text-center gap-4 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Target className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">No Savings Goals Yet</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Create your first savings goal to start tracking progress towards your financial milestones.
            </p>
          </div>
          <button
            onClick={() => { setFormError(''); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Goal</span>
          </button>
        </div>
      )}

      {/* Goals grid */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map((g) => {
            const percent = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
            const remaining = Math.max(0, g.target - g.current);
            const isComplete = percent >= 100;
            return (
              <div key={g.id} className="glass-card p-6 rounded-2xl space-y-4 relative group">
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(g.id)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete goal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${g.color}20` }}>
                    {isComplete
                      ? <Check className="w-4 h-4" style={{ color: g.color }} />
                      : <Target className="w-4 h-4" style={{ color: g.color }} />
                    }
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                    {isComplete ? '✓ Completed' : `${percent}% Saved`}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-white">{g.name}</h3>
                  <p className="text-2xl font-bold text-white mt-1">
                    ₹{g.current.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-slate-400"> / ₹{g.target.toLocaleString('en-IN')}</span>
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%`, backgroundColor: g.color }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Remaining: ₹{remaining.toLocaleString('en-IN')}</span>
                  <span>By {g.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-5 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" /> New Savings Goal
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Fund, Trip to Europe..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Target Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="500000"
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Already Saved (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.current}
                    onChange={(e) => setForm({ ...form, current: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Target Date</label>
                <input
                  type="date"
                  required
                  min={today}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-2 font-medium">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {GOAL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow-lg shadow-blue-600/25"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
