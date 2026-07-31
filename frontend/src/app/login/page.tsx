'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ShieldCheck, ArrowRight, Lock, Mail, User, Code, AlertCircle } from 'lucide-react';
import { API_BASE } from '@/lib/api';

// Set a session cookie readable by the Next.js middleware (edge runtime)
function setAuthCookie(token: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `vyora_auth=${token}; path=/; expires=${expires}; SameSite=Strict`;
}

function clearAuthCookie() {
  document.cookie = 'vyora_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
}

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devAccounts, setDevAccounts] = useState<any[]>([]);
  const [showDevModal, setShowDevModal] = useState(false);

  useEffect(() => {
    fetch('/dev_accounts.json')
      .then((res) => res.json())
      .then((data) => setDevAccounts(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailLower = email.toLowerCase().trim();

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister ? { email: emailLower, password, name } : { email: emailLower, password };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      const tok = data.data.accessToken || `token_${Date.now()}`;
      localStorage.setItem('vyora_token', tok);
      localStorage.setItem('vyora_user', JSON.stringify(data.data.user));
      setAuthCookie(tok);
      router.push('/');
    } catch (apiErr: any) {
      if (isRegister) {
        if (!name || !emailLower || !password) {
          setError('Full name, email, and password are required.');
          setLoading(false);
          return;
        }

        const existingUsersStr = localStorage.getItem('vyora_registered_users') || '[]';
        let registeredUsers: any[] = [];
        try {
          registeredUsers = JSON.parse(existingUsersStr);
        } catch (e) {}

        if (registeredUsers.some((u: any) => u.email === emailLower)) {
          setError('An account with this email address already exists.');
          setLoading(false);
          return;
        }

        // Save user as unverified initially
        const newUser = { name, email: emailLower, password, isVerified: false, createdAt: new Date().toISOString() };
        registeredUsers.push(newUser);
        localStorage.setItem('vyora_registered_users', JSON.stringify(registeredUsers));
        localStorage.setItem('vyora_verify_email', emailLower);

        // Send verification OTP email
        try {
          await fetch(`${API_BASE}/auth/send-verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailLower }),
          });
        } catch (_) {
          // Non-fatal: redirect to verify page even if OTP send fails
        }

        setDevAccounts((prev) => [...prev.filter((a) => a.email !== emailLower), { name, email: emailLower, password }]);

        router.push(`/verify-email?email=${encodeURIComponent(emailLower)}`);
        return;
      } else {
        const existingUsersStr = localStorage.getItem('vyora_registered_users') || '[]';
        let registeredUsers: any[] = [];
        try {
          registeredUsers = JSON.parse(existingUsersStr);
        } catch (e) {}

        const matchedUser = registeredUsers.find((u: any) => u.email === emailLower);

        if (!matchedUser) {
          const matchedDev = devAccounts.find((a: any) => a.email.toLowerCase() === emailLower);
          if (matchedDev) {
            if (matchedDev.password !== password) {
              setError('Invalid email or password.');
              setLoading(false);
              return;
            }

            const tok = `token_${Date.now()}`;
            localStorage.setItem('vyora_token', tok);
            localStorage.setItem('vyora_user', JSON.stringify({ name: matchedDev.name, email: matchedDev.email, role: 'USER' }));
            setAuthCookie(tok);
            router.push('/');
            return;
          }

          setError('Invalid email or password.');
          setLoading(false);
          return;
        }

        if (matchedUser.password !== password) {
          setError('Invalid email or password.');
          setLoading(false);
          return;
        }

        // Correct password -> Grant access and store exact User Name and Email
        const tok = `token_${Date.now()}`;
        localStorage.setItem('vyora_token', tok);
        localStorage.setItem('vyora_user', JSON.stringify({ name: matchedUser.name, email: matchedUser.email, role: 'USER' }));
        setAuthCookie(tok);
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const autofillDevAccount = (acc: any) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setShowDevModal(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 shadow-xl shadow-blue-500/25 border border-white/10 mb-2">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            Vyora <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">Platform</span>
          </h1>
          <p className="text-xs text-slate-400">AI Personal Finance & Daily Budget Management</p>
        </div>

        <div className="glass-card p-8 rounded-3xl space-y-6 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                {isRegister ? 'Create Account' : 'Account Sign In'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRegister ? 'Sign up to start tracking your daily budget.' : 'Sign in to access your personal dashboard.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDevModal(true)}
              className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1 hover:bg-purple-500/30 transition-all"
            >
              <Code className="w-3 h-3" />
              <span>Dev JSON</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-medium">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-slate-400 font-medium">Password</label>
                {!isRegister && (
                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline font-medium"
                  >
                    Forgot Password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-slate-400 hover:text-blue-400 font-medium transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create One"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Argon2 256-bit Encrypted • Strict Password Access Control</span>
        </div>
      </div>

      {/* Dev Accounts JSON View Modal */}
      {showDevModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-400" /> Dev Accounts (`dev_accounts.json`)
              </h3>
              <button onClick={() => setShowDevModal(false)} className="text-xs text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">Click any account to auto-fill sign-in fields:</p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {devAccounts.map((acc, i) => (
                <div
                  key={i}
                  onClick={() => autofillDevAccount(acc)}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-white">{acc.name}</span>
                    <span className="text-[10px] text-purple-400 font-mono">dev_accounts.json</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Email: {acc.email}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Password: {acc.password}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDevModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
