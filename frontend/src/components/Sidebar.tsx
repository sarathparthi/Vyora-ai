'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  BarChart3, 
  Bot, 
  Wallet, 
  Target, 
  FileText, 
  Settings, 
  Sparkles,
  UsersRound,
  Laptop,
  Linkedin,
  X
} from 'lucide-react';
import { getCurrentUserEmail } from '@/lib/api';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Shared Finance', href: '/shared-finance', icon: UsersRound, badge: 'Family' },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Financial Advisor', href: '/ai-advisor', icon: Bot, badge: 'Gemini' },
  { name: 'Wallets & Accounts', href: '/wallets', icon: Wallet },
  { name: 'Savings Goals', href: '/goals', icon: Target },
  { name: 'Devices & Sessions', href: '/devices', icon: Laptop, badge: 'Sync' },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const email = getCurrentUserEmail();
    setUserEmail(email);
    const storedUser = localStorage.getItem('vyora_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.name) setUserName(u.name);
      } catch (e) {}
    }
  }, []);

  const content = (
    <div className="flex flex-col h-full bg-[#0F172A] border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800/60">
        <Link href="/" onClick={onCloseMobile} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
              Vyora <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">SaaS</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">AI Finance OS</p>
          </div>
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Developer Attribution & Logged-In User Info */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-900/40 space-y-3">
        {/* Developer Attribution Badge */}
        <a
          href="https://www.linkedin.com/in/sarath-p-a11s/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 hover:border-blue-500/50 transition-all text-xs group"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Linkedin className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block leading-tight">Architected by</span>
              <span className="font-bold text-white group-hover:text-blue-400 transition-colors">Sarath P</span>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">Contact</span>
        </a>

        {/* Logged in user profile */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/40 border border-slate-700/40">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center border border-blue-500/30">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{userName}</p>
            <p className="text-[11px] text-slate-400 truncate">{userEmail || 'user@vyora.ai'}</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 h-screen fixed left-0 top-0 z-30">
        {content}
      </aside>

      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      <div
        className={`lg:hidden fixed left-0 top-0 w-72 h-full z-50 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </div>
    </>
  );
}
