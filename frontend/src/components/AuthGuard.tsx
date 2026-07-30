'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('vyora_token');
    const isLoginPage = pathname === '/login';

    if (!token && !isLoginPage) {
      setIsAuthenticated(false);
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  // If on login page, render full login layout without sidebar
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Show spinning loader while checking authentication state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="pl-64 pt-16 min-h-screen transition-all duration-300">
        <div className="p-8 max-w-7xl mx-auto space-y-8">{children}</div>
      </main>
    </>
  );
}
