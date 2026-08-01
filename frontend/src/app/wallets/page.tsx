'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Building2, Plus, TrendingUp, Landmark, Coins, ShieldCheck, PieChart, Sparkles } from 'lucide-react';
import { getCurrentUserEmail, getUserAccountStore, saveUserAccountStore } from '@/lib/api';

const DEFAULT_INVESTMENTS = [
  { name: 'Nifty 50 Index Mutual Funds', type: 'MUTUAL_FUND', value: 145000, returns: '+14.2%', color: '#10B981' },
  { name: 'HDFC & Reliance Equity Stocks', type: 'STOCKS', value: 92000, returns: '+8.7%', color: '#3B82F6' },
  { name: 'Digital & Physical Gold (24K)', type: 'GOLD', value: 45000, returns: '+18.4%', color: '#F59E0B' },
  { name: 'SBI Fixed Deposit (FD 7.5%)', type: 'FD', value: 200000, returns: '+7.5%', color: '#8B5CF6' },
];

export default function WalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState('BANK_ACCOUNT');

  useEffect(() => {
    const email = getCurrentUserEmail();
    setUserEmail(email);
    const store = getUserAccountStore(email);
    if (store && store.wallets) {
      setWallets(store.wallets);
    }
  }, []);

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newWallet = {
      id: `w-${Date.now()}`,
      name,
      type,
      balance: parseFloat(balance) || 0,
      currency: 'INR',
      color: type === 'CREDIT_CARD' ? '#DC2626' : '#3B82F6',
      isDefault: wallets.length === 0,
    };

    const updatedWallets = [...wallets, newWallet];
    setWallets(updatedWallets);

    const store = getUserAccountStore(userEmail);
    store.wallets = updatedWallets;
    saveUserAccountStore(userEmail, store);

    setName('');
    setBalance('');
    setShowAddModal(false);
  };

  const totalBankBalance = wallets.reduce((acc, w) => acc + (w.type !== 'CREDIT_CARD' ? (w.balance || 0) : 0), 0);
  const totalCreditDebt = wallets.reduce((acc, w) => acc + (w.type === 'CREDIT_CARD' ? Math.abs(w.balance || 0) : 0), 0);
  const totalInvestments = DEFAULT_INVESTMENTS.reduce((acc, inv) => acc + inv.value, 0);
  const netWorth = totalBankBalance + totalInvestments - totalCreditDebt;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Wallets, Accounts &amp; Net Worth <Landmark className="w-6 h-6 text-blue-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track bank balances, credit cards, investments (Stocks, Mutual Funds, Gold, FDs) and Net Worth.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Account</span>
        </button>
      </div>

      {/* Net Worth Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl space-y-2 border-l-4 border-l-emerald-500">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Net Worth</span>
          <p className="text-2xl font-extrabold text-emerald-400">₹{netWorth.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-slate-500">Liquid assets + Investments - Credit Card Liabilities</span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2 border-l-4 border-l-blue-500">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Bank &amp; Cash Accounts</span>
          <p className="text-2xl font-extrabold text-blue-400">₹{totalBankBalance.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-slate-500">Across {wallets.filter((w) => w.type !== 'CREDIT_CARD').length} connected wallets</span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2 border-l-4 border-l-purple-500">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Investment Assets</span>
          <p className="text-2xl font-extrabold text-purple-400">₹{totalInvestments.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-slate-500">Mutual Funds, Stocks, Gold, FDs</span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2 border-l-4 border-l-rose-500">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Credit Card Liabilities</span>
          <p className="text-2xl font-extrabold text-rose-400">₹{totalCreditDebt.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-slate-500">Outstanding credit card balances</span>
        </div>
      </div>

      {/* Grid of Wallets */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-400" /> Bank Accounts &amp; Cards
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {wallets.map((w) => (
            <div key={w.id} className="glass-card glass-card-hover p-5 rounded-2xl space-y-4 border-t-4" style={{ borderTopColor: w.color || '#3B82F6' }}>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: `${w.color || '#3B82F6'}20` }}>
                  {w.type === 'CREDIT_CARD' ? <CreditCard className="w-4 h-4" style={{ color: w.color }} /> : <Building2 className="w-4 h-4" style={{ color: w.color }} />}
                </div>
                {w.isDefault && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                    Primary
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400 truncate">{w.name}</p>
                <h3 className="text-2xl font-bold text-white mt-1">₹{(w.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
              </div>

              <p className="text-[10px] text-slate-500 font-semibold uppercase">{(w.type || 'BANK_ACCOUNT').replace('_', ' ')} • {w.currency || 'INR'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 📉 Investments Portfolio Overview */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" /> Investments &amp; Asset Portfolio
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Stocks, Mutual Funds, Digital Gold, and Fixed Deposits</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Total Assets: ₹{totalInvestments.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEFAULT_INVESTMENTS.map((inv, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold" style={{ backgroundColor: `${inv.color}20`, color: inv.color }}>
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">{inv.name}</p>
                  <span className="text-[10px] text-slate-400 font-mono">{inv.type}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-white block">₹{inv.value.toLocaleString('en-IN')}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{inv.returns}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Wallet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Connect New Account</h3>
            <form onSubmit={handleAddWallet} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Salary Account / Cash Wallet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Opening Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="10000.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Account Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                >
                  <option value="BANK_ACCOUNT">Bank Account</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="CASH_WALLET">Cash Wallet</option>
                  <option value="INVESTMENT">Investment Account</option>
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
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
