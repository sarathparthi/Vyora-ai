'use client';

import { useState } from 'react';
import { CreditCard, Building2, Plus } from 'lucide-react';

const WALLETS_MOCK = [
  { id: '1', name: 'ICICI Savings Account', type: 'BANK_ACCOUNT', balance: 184500.0, currency: 'INR', color: '#2563EB', isDefault: true },
  { id: '2', name: 'High-Yield Fixed Deposit (7.2% APY)', type: 'BANK_ACCOUNT', balance: 450000.0, currency: 'INR', color: '#059669', isDefault: false },
  { id: '3', name: 'HDFC Regalia Credit Card', type: 'CREDIT_CARD', balance: 24500.0, currency: 'INR', color: '#DC2626', isDefault: false },
  { id: '4', name: 'Petty Cash Wallet', type: 'CASH_WALLET', balance: 8500.0, currency: 'INR', color: '#F59E0B', isDefault: false },
];

export default function WalletsPage() {
  const [wallets] = useState(WALLETS_MOCK);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Wallets & Bank Accounts</h1>
          <p className="text-xs text-slate-400 mt-1">Multi-account balance management, credit cards, and cash balances in Indian Rupees (₹).</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all">
          <Plus className="w-4 h-4" />
          <span>Connect Account</span>
        </button>
      </div>

      {/* Grid of Wallets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {wallets.map((w) => (
          <div key={w.id} className="glass-card glass-card-hover p-5 rounded-2xl space-y-4 border-t-4" style={{ borderTopColor: w.color }}>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: `${w.color}20` }}>
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
              <h3 className="text-2xl font-bold text-white mt-1">₹{w.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>

            <p className="text-[10px] text-slate-500 font-semibold uppercase">{w.type.replace('_', ' ')} • {w.currency}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
