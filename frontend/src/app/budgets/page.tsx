'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, CheckCircle2, Zap, CreditCard, Calendar as CalendarIcon, Clock, Bell, Sparkles } from 'lucide-react';
import { getCurrentUserEmail, getUserAccountStore, saveUserAccountStore, getDaysInMonth } from '@/lib/api';

const DEFAULT_SUBSCRIPTIONS = [
  { name: 'Netflix Premium', amount: 649, renewalDay: 5, icon: '🎬' },
  { name: 'Spotify Duo', amount: 149, renewalDay: 12, icon: '🎵' },
  { name: 'Amazon Prime', amount: 299, renewalDay: 18, icon: '📦' },
  { name: 'ChatGPT Plus AI', amount: 1999, renewalDay: 22, icon: '🤖' },
  { name: 'YouTube Premium', amount: 189, renewalDay: 28, icon: '▶️' },
];

const DEFAULT_BILL_REMINDERS = [
  { title: 'Apartment Rent', amount: 25000, dueDay: 1, category: 'Housing', status: 'DUE_SOON' },
  { title: 'Home Loan / Car EMI', amount: 18500, dueDay: 10, category: 'Debt/Loan', status: 'UPCOMING' },
  { title: 'Electricity & Utility Bill', amount: 2400, dueDay: 15, category: 'Utilities', status: 'UPCOMING' },
  { title: 'Wi-Fi Broadband', amount: 999, dueDay: 20, category: 'Internet', status: 'PAID' },
  { title: 'Term Insurance SIP', amount: 4500, dueDay: 25, category: 'Insurance', status: 'UPCOMING' },
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [monthlyCap, setMonthlyCap] = useState<number>(0);
  const [userEmail, setUserEmail] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCapModal, setShowCapModal] = useState(false);

  // New Category Budget Form
  const [category, setCategory] = useState('');
  const [allocated, setAllocated] = useState('');

  // Master Cap Form
  const [newMasterCap, setNewMasterCap] = useState('');

  const loadBudgets = () => {
    const email = getCurrentUserEmail();
    setUserEmail(email);
    const store = getUserAccountStore(email);
    if (store) {
      setBudgets(store.budgets || []);
      setMonthlyCap(Number(store.monthlyBudgetCap || 0));
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleSaveMasterCap = (e: React.FormEvent) => {
    e.preventDefault();
    const capNum = parseFloat(newMasterCap) || 0;

    const store = getUserAccountStore(userEmail);
    store.monthlyBudgetCap = capNum;
    saveUserAccountStore(userEmail, store);

    setMonthlyCap(capNum);
    setShowCapModal(false);
  };

  const handleAddCategoryBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !allocated) return;

    const newBud = {
      id: `b-${Date.now()}`,
      category,
      allocated: parseFloat(allocated),
      spent: 0,
      color: '#3B82F6',
    };

    const updated = [...budgets, newBud];
    setBudgets(updated);

    const store = getUserAccountStore(userEmail);
    store.budgets = updated;
    saveUserAccountStore(userEmail, store);

    setCategory('');
    setAllocated('');
    setShowAddModal(false);
  };

  const totalCategoryAllocated = budgets.reduce((acc, b) => acc + Number(b.allocated || 0), 0);
  const totalSubscriptions = DEFAULT_SUBSCRIPTIONS.reduce((acc, s) => acc + s.amount, 0);
  const daysInMonth = getDaysInMonth(new Date().getFullYear(), new Date().getMonth() + 1);
  const dailyAllowance = monthlyCap > 0 ? monthlyCap / daysInMonth : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Budgets, Subscriptions &amp; Bill Calendar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Set master spending caps, track daily allowances, automated subscriptions, and bill reminders in Indian Rupees (₹).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCapModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Zap className="w-4 h-4 text-blue-400" />
            <span>Set Monthly Cap</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Category Budget</span>
          </button>
        </div>
      </div>

      {/* Overall Master Budget & Daily Allowance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border-l-4 border-l-blue-500 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-300">Master Monthly Budget Cap</h2>
              <p className="text-2xl font-bold text-white mt-1">
                ₹{monthlyCap.toLocaleString('en-IN')} <span className="text-xs text-slate-400 font-normal">/ month</span>
              </p>
            </div>
            <button
              onClick={() => setShowCapModal(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
            >
              Update Cap
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Daily Budget Allowance</span>
              <span className="text-lg font-bold text-emerald-400 mt-0.5 block">₹{dailyAllowance.toFixed(2)} / day</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Days in Current Month</span>
              <span className="text-lg font-bold text-white mt-0.5 block">{daysInMonth} Days</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-3 flex flex-col justify-between">
          <h3 className="font-semibold text-sm text-white">Category Caps Summary</h3>
          <div>
            <p className="text-2xl font-bold text-white">₹{totalCategoryAllocated.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total allocated across {budgets.length} categories</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700"
          >
            Add Category Cap
          </button>
        </div>
      </div>

      {/* 💰 Subscription Tracker & Recurring Bill Reminders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Tracker */}
        <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" /> Automated Subscription Tracker
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">AI detected active digital subscriptions</p>
            </div>
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              ₹{totalSubscriptions.toLocaleString('en-IN')}/mo
            </span>
          </div>

          <div className="space-y-2.5">
            {DEFAULT_SUBSCRIPTIONS.map((sub, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-base">{sub.icon}</span>
                  <div>
                    <p className="font-semibold text-white">{sub.name}</p>
                    <span className="text-[10px] text-slate-400">Renews on {sub.renewalDay}th of each month</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-rose-400">₹{sub.amount}/mo</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recurring Bill Reminders */}
        <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" /> Upcoming Bill Reminders &amp; Deadlines
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Rent, EMI, Wi-Fi, and Insurance due dates</p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              5 Due Bills
            </span>
          </div>

          <div className="space-y-2.5">
            {DEFAULT_BILL_REMINDERS.map((bill, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    {bill.dueDay}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{bill.title}</p>
                    <span className="text-[10px] text-slate-400">{bill.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-white block">₹{bill.amount.toLocaleString('en-IN')}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      bill.status === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : bill.status === 'DUE_SOON'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {bill.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      {budgets.length === 0 ? (
        <div className="glass-card p-8 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No Category Budgets Configured</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Set budget caps for specific categories like Groceries, Rent, or Dining to receive automated warnings!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Category Cap</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {budgets.map((b) => {
            const catSpent = Number(b.spent || 0);
            const catAlloc = Number(b.allocated || 1);
            const catPercent = Math.round((catSpent / catAlloc) * 100);
            const isOver = catPercent >= 100;
            const isWarning = catPercent >= 80 && !isOver;

            return (
              <div key={b.id} className="glass-card glass-card-hover p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
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
                  <span>Spent: ₹{catSpent.toLocaleString('en-IN')}</span>
                  <span className="font-semibold text-slate-400">Cap: ₹{catAlloc.toLocaleString('en-IN')}</span>
                </div>

                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, catPercent)}%`,
                      backgroundColor: isOver ? '#EF4444' : isWarning ? '#F59E0B' : '#3B82F6',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Set Monthly Master Cap Modal */}
      {showCapModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Set Monthly Budget Cap</h3>
            <form onSubmit={handleSaveMasterCap} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Monthly Master Cap (₹)</label>
                <input
                  type="number"
                  step="100"
                  required
                  placeholder="e.g. 50000"
                  value={newMasterCap}
                  onChange={(e) => setNewMasterCap(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCapModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow-lg shadow-blue-600/25"
                >
                  Save Master Cap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add Category Budget Cap</h3>
            <form onSubmit={handleAddCategoryBudget} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Groceries / Fuel / Dining"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Category Cap Amount (₹)</label>
                <input
                  type="number"
                  step="100"
                  required
                  placeholder="10000"
                  value={allocated}
                  onChange={(e) => setAllocated(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow-lg shadow-blue-600/25"
                >
                  Save Category Cap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
