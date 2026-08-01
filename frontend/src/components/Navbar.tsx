'use client';

import { Search, Menu, LogOut, ShieldCheck, Plus, Linkedin, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  onOpenAddModal?: () => void;
}

export function Navbar({ onToggleMobileMenu, onOpenAddModal }: NavbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');

  useEffect(() => {
    setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const handleOnline = () => {
      setIsOnline(true);
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }, 1500);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sync pulse simulation
    const interval = setInterval(() => {
      if (navigator.onLine) {
        setIsSyncing(true);
        setTimeout(() => {
          setIsSyncing(false);
          setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1200);
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vyora_token');
    localStorage.removeItem('vyora_user');
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
        {/* Real-time Multi-Device Sync Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold transition-all"
          style={{
            backgroundColor: !isOnline ? 'rgba(239, 68, 68, 0.1)' : isSyncing ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            borderColor: !isOnline ? 'rgba(239, 68, 68, 0.3)' : isSyncing ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)',
            color: !isOnline ? '#EF4444' : isSyncing ? '#F59E0B' : '#10B981',
          }}
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-500" />
              <span>Offline Mode</span>
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Syncing...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span>Synced ({lastSyncedTime || 'Now'})</span>
            </>
          )}
        </div>

        {/* Developer Credit Link */}
        <a
          href="https://www.linkedin.com/in/sarath-p-a11s/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-semibold transition-all"
        >
          <Linkedin className="w-3.5 h-3.5 text-blue-400" />
          <span>Dev: Sarath P</span>
        </a>

        {/* Currency Pill */}
        <div className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] sm:text-xs text-slate-200 font-bold flex-shrink-0">
          INR (₹)
        </div>

        {/* Quick Add Action Button */}
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
