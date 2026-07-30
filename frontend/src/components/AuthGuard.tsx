'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const PUBLIC_AUTH_ROUTES = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    const token = localStorage.getItem('vyora_token');

    if (!token && !isPublicAuthRoute) {
      setIsAuthenticated(false);
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router, isPublicAuthRoute]);

  // Render public auth pages full-screen without Sidebar / Navbar
  if (isPublicAuthRoute) {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
      <Navbar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <main className="pl-0 lg:pl-64 pt-16 min-h-screen transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">{children}</div>
      </main>
    </>
  );
}
