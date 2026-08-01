'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  Activity,
  Bell,
  Search,
  Lock,
  ChevronRight,
} from 'lucide-react';

const ADMIN_NAV = [
  { name: 'Platform Overview', href: '/admin', icon: Activity },
  { name: 'User Management', href: '/admin/users', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminName, setAdminName] = useState('Super Admin');
  const [adminEmail, setAdminEmail] = useState('admin@vyoraai.in');

  useEffect(() => {
    const userStr = localStorage.getItem('vyora_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.role === 'SUPER_ADMIN' || u.email === 'admin@vyoraai.in') {
          setIsAdmin(true);
          if (u.name) setAdminName(u.name);
          if (u.email) setAdminEmail(u.email);
          return;
        }
      } catch (e) {}
    }
    // Block unauthorized access
    setIsAdmin(false);
  }, []);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 font-semibold text-xs text-purple-400">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Verifying Super Admin Authorization...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex items-center justify-center p-6 text-center">
        <div className="glass-card p-8 rounded-3xl max-w-md space-y-4 border border-rose-500/40 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">403 Unauthorized Access</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You do not have <strong className="text-rose-400">SUPER_ADMIN</strong> permissions to view the Vyora Platform Administration Suite.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Sign In as Super Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('vyora_token');
    localStorage.removeItem('vyora_user');
    document.cookie = 'vyora_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex">
      {/* Super Admin Sidebar */}
      <aside className="w-64 bg-[#0F1423] border-r border-slate-800 flex flex-col fixed inset-y-0 z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-600/25">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                Vyora <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/30">ADMIN</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Super Admin Suite</p>
            </div>
          </div>
        </div>

        {/* Admin Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow-lg shadow-purple-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            );
          })}
        </nav>

        {/* Logged in Super Admin */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-9 h-9 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center border border-rose-400">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{adminName}</p>
              <p className="text-[10px] text-slate-400 truncate">{adminEmail}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Admin Suite</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Body */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#0F1423]/90 backdrop-blur-xl border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Vyora Control Panel</span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-bold text-white">
              {pathname === '/admin/users' ? 'User Analytics & Control' : 'Global Platform Overview'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System 100% Operational</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Root Super Admin Active
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
