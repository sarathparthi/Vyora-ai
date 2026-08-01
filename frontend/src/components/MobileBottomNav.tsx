'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, UsersRound, PieChart, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMobileMenu: () => void;
}

export function MobileBottomNav({ onOpenMobileMenu }: MobileBottomNavProps) {
  const pathname = usePathname();

  // Hide on admin routes or auth pages
  if (pathname.startsWith('/admin') || ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'].includes(pathname)) {
    return null;
  }

  const items = [
    { name: 'Home', href: '/', icon: LayoutDashboard },
    { name: 'Ledger', href: '/transactions', icon: Receipt },
    { name: 'Shared', href: '/shared-finance', icon: UsersRound },
    { name: 'Budgets', href: '/budgets', icon: PieChart },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0F172A]/95 backdrop-blur-xl border-t border-slate-800 z-30 px-3 flex items-center justify-around shadow-2xl">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl text-[10px] font-semibold transition-all ${
              isActive
                ? 'text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-blue-400 scale-110' : 'text-slate-400'}`} />
            <span>{item.name}</span>
          </Link>
        );
      })}

      {/* Menu Toggle */}
      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center w-14 h-12 rounded-xl text-[10px] font-semibold text-slate-400 hover:text-slate-200"
      >
        <Menu className="w-5 h-5 mb-0.5 text-slate-400" />
        <span>More</span>
      </button>
    </nav>
  );
}
