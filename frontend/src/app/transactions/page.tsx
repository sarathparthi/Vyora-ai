'use client';

import { useState } from 'react';
import { Search, Plus, Download, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const MOCK_TRANSACTIONS = [
  { id: '1', description: 'Dinner at Royal Bistro', category: 'Food & Dining', wallet: 'HDFC Credit Card', amount: 1450.5, type: 'EXPENSE', date: '2026-07-29', tags: 'dining,food' },
  { id: '2', description: 'Monthly Tech Salary', category: 'Salary', wallet: 'ICICI Savings', amount: 130000.0, type: 'INCOME', date: '2026-07-28', tags: 'salary,tech' },
  { id: '3', description: 'Apartment Rent Payment', category: 'Rent & Housing', wallet: 'ICICI Savings', amount: 35000.0, type: 'EXPENSE', date: '2026-07-27', tags: 'rent,housing' },
  { id: '4', description: 'Freelance Design Contract', category: 'Freelance & Business', wallet: 'ICICI Savings', amount: 36000.0, type: 'INCOME', date: '2026-07-25', tags: 'freelance' },
  { id: '5', description: 'Gas Station Refill', category: 'Fuel & Transportation', wallet: 'HDFC Credit Card', amount: 3500.0, type: 'EXPENSE', date: '2026-07-24', tags: 'fuel' },
  { id: '6', description: 'ChatGPT & Storage Sub', category: 'Subscriptions', wallet: 'ICICI Savings', amount: 1999.0, type: 'EXPENSE', date: '2026-07-23', tags: 'software' },
];

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [category, setCategory] = useState('Food & Dining');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    const newTx = {
      id: String(Date.now()),
      description: desc,
      category,
      wallet: 'ICICI Savings',
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString().split('T')[0],
      tags: 'new',
    };

    setTransactions([newTx, ...transactions]);
    setDesc('');
    setAmount('');
    setShowAddModal(false);
  };

  const filtered = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const exportCSV = () => {
    const headers = ['Description,Category,Wallet,Amount,Type,Date\n'];
    const rows = filtered.map(t => `"${t.description}","${t.category}","${t.wallet}",${t.amount},"${t.type}","${t.date}"\n`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vyora_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">Manage, filter, and export all your income & expense activity in Indian Rupees (₹).</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all">
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description, tags, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {['ALL', 'INCOME', 'EXPENSE'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === t ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Wallet</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {tx.type === 'INCOME' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{tx.description}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">#{tx.tags}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-300 font-medium">{tx.category}</td>
                  <td className="py-4 px-4 text-slate-400">{tx.wallet}</td>
                  <td className="py-4 px-4 text-slate-400">{tx.date}</td>
                  <td className={`py-4 px-6 text-right font-bold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add New Transaction</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grocery Store Shopping"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="4500.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                >
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Salary">Salary</option>
                  <option value="Freelance & Business">Freelance & Business</option>
                  <option value="Rent & Housing">Rent & Housing</option>
                  <option value="Fuel & Transportation">Fuel & Transportation</option>
                </select>
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
