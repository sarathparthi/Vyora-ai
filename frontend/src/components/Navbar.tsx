'use client';

import { Search, Menu, LogOut, ShieldCheck, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  onOpenAddModal?: () => void;
}

export function Navbar({ onToggleMobileMenu, onOpenAddModal }: NavbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('vyora_token');
    localStorage.removeItem('vyora_user');
    // Clear the middleware auth cookie so protected routes are immediately blocked
    document.cookie = 'vyora_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    router.push('/login');
  };

  return (
    <header className="h-16 fixed top-0 right-0 left-0 lg:left-64 bg-[#0F172A]/90 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between z-20">
      {/* Left Mobile Menu Toggle & Global Search */}
      <div className="flex items-center gap-3 w-full max-w-md">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all flex-shrink-0"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4 ml-2">
        {/* Security Indicator (Hidden on small mobile) */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Argon2 Encrypted</span>
        </div>

        {/* Currency Pill */}
        <div className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] sm:text-xs text-slate-200 font-bold flex-shrink-0">
          INR (₹)
        </div>

        {/* Quick Add Action Button (Icon only on tiny screens) */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Entry</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-all flex-shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
