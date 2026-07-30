'use client';

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
  ShieldAlert
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Financial Advisor', href: '/ai-advisor', icon: Bot, badge: 'Gemini' },
  { name: 'Wallets & Accounts', href: '/wallets', icon: Wallet },
  { name: 'Savings Goals', href: '/goals', icon: Target },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-[#0F172A]/80 backdrop-blur-xl border-r border-slate-800 flex flex-col z-30">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800/60">
        <Link href="/" className="flex items-center gap-3">
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

      {/* Footer User Info */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-900/30">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/40 border border-slate-700/40">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
            alt="Alex Vance"
            className="w-9 h-9 rounded-full object-cover border border-blue-500/30"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Alex Vance</p>
            <p className="text-[11px] text-slate-400 truncate">demo@vyora.ai</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
        </div>
      </div>
    </aside>
  );
}
