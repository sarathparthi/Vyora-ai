'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Download, ArrowDownLeft, ArrowUpRight, Receipt, Tag } from 'lucide-react';
import { getCurrentUserEmail, getUserAccountStore, saveUserAccountStore } from '@/lib/api';

const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Salary',
  'Freelance & Business',
  'Rent & Housing',
  'Fuel & Transportation',
  'Utilities & Subscriptions',
  'Shopping & Tech',
  'Health & Medical',
  'Investments & Savings',
];

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>(DEFAULT_CATEGORIES);
  const [userEmail, setUserEmail] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [category, setCategory] = useState('Food & Dining');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [walletName, setWalletName] = useState('Main Bank Account');

  useEffect(() => {
    const email = getCurrentUserEmail();
    setUserEmail(email);
    const store = getUserAccountStore(email);
    if (store) {
      if (store.transactions) {
        setTransactions(store.transactions);
      }
      // Load saved custom categories if any
      const savedCustom = store.customCategories || [];
      const combined = Array.from(new Set([...DEFAULT_CATEGORIES, ...savedCustom]));
      setCategoriesList(combined);
    }
  }, []);

  const handleCategorySelectChange = (val: string) => {
    if (val === '__ADD_NEW_CATEGORY__') {
      setIsCustomCategory(true);
      setCustomCategoryInput('');
    } else {
      setIsCustomCategory(false);
      setCategory(val);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    let finalCategory = category;
    if (isCustomCategory) {
      const trimmedCustom = customCategoryInput.trim();
      if (!trimmedCustom) return;
      finalCategory = trimmedCustom;
    }

    const parsedAmount = parseFloat(amount);

    const newTx = {
      id: `tx-${Date.now()}`,
      description: desc,
      category: finalCategory,
      wallet: walletName,
      amount: parsedAmount,
      type,
      date: new Date().toISOString().split('T')[0],
      tags: type === 'INCOME' ? 'income' : 'expense',
    };

    const updatedTransactions = [newTx, ...transactions];
    setTransactions(updatedTransactions);

    // Save custom category to list if new
    let updatedCategories = categoriesList;
    if (!categoriesList.includes(finalCategory)) {
      updatedCategories = [...categoriesList, finalCategory];
      setCategoriesList(updatedCategories);
    }

    // Save to user persistent store
    const store = getUserAccountStore(userEmail) || {};
    store.transactions = updatedTransactions;
    store.customCategories = updatedCategories.filter((c) => !DEFAULT_CATEGORIES.includes(c));

    // Update wallet balance
    if (store.wallets && store.wallets.length > 0) {
      const targetWallet = store.wallets.find((w: any) => w.name === walletName) || store.wallets[0];
      if (type === 'INCOME') {
        targetWallet.balance += parsedAmount;
      } else {
        targetWallet.balance -= parsedAmount;
      }
    }

    saveUserAccountStore(userEmail, store);

    setDesc('');
    setAmount('');
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setShowAddModal(false);
  };

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Description,Category,Wallet,Amount,Type,Date\n'];
    const rows = filtered.map(
      (t) => `"${t.description}","${t.category}","${t.wallet}",${t.amount},"${t.type}","${t.date}"\n`
    );
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
          <p className="text-xs text-slate-400 mt-1">
            Manage, filter, and export all your income &amp; expense activity with custom categories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all"
          >
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
            placeholder="Search description, category..."
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
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No Transactions Recorded Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your account ledger is currently clean. Click the button below to record your first entry with a custom category!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Transaction</span>
            </button>
          </div>
        ) : (
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
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {tx.type === 'INCOME' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{tx.description}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">#{tx.tags || 'general'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/80 text-[11px]">
                        <Tag className="w-3 h-3 text-blue-400" />
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">{tx.wallet}</td>
                    <td className="py-4 px-4 text-slate-400">{tx.date}</td>
                    <td
                      className={`py-4 px-6 text-right font-bold ${
                        tx.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}₹
                      {tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal with Custom Category Creation */}
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
                  placeholder="e.g. Client Payment / Gym Membership"
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
                    placeholder="2500.00"
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

              {/* Category Selector with Custom Option */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-400 font-medium">Category</label>
                  {!isCustomCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(true);
                        setCustomCategoryInput('');
                      }}
                      className="text-[11px] text-blue-400 hover:underline font-semibold"
                    >
                      + Add New Category
                    </button>
                  )}
                </div>

                {!isCustomCategory ? (
                  <select
                    value={category}
                    onChange={(e) => handleCategorySelectChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                  >
                    {categoriesList.map((catName) => (
                      <option key={catName} value={catName}>
                        {catName}
                      </option>
                    ))}
                    <option value="__ADD_NEW_CATEGORY__">➕ Add Custom Category...</option>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Enter your custom category name..."
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        className="flex-1 bg-slate-900 border border-blue-500/70 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomCategory(false)}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                    <span className="text-[10px] text-blue-400 block">
                      This custom category will be saved to your account.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCategory(false);
                    setShowAddModal(false);
                  }}
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
