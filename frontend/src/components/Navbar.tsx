'use client';

import { Search, Bell, Plus, LogOut, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Navbar({ onOpenAddModal }: { onOpenAddModal?: () => void }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('vyora_token');
    localStorage.removeItem('vyora_user');
    router.push('/login');
  };

  return (
    <header className="h-16 fixed top-0 right-0 left-64 bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-800 px-8 flex items-center justify-between z-20">
      {/* Global Search Bar */}
      <div className="relative w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search transactions, tags, categories, AI queries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Security Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Argon2 256-bit Encrypted</span>
        </div>

        {/* Currency Pill */}
        <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200 font-bold">
          INR (₹)
        </div>

        {/* Quick Add Action Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Entry</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
