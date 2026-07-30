'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Building2, Plus } from 'lucide-react';
import { getCurrentUserEmail, getUserAccountStore, saveUserAccountStore } from '@/lib/api';

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Wallets & Bank Accounts</h1>
          <p className="text-xs text-slate-400 mt-1">Multi-account balance management, credit cards, and cash balances in Indian Rupees (₹).</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Account</span>
        </button>
      </div>

      {/* Grid of Wallets */}
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
