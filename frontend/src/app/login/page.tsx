'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ShieldCheck, ArrowRight, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { API_BASE } from '@/lib/api';

function setAuthCookie(token: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `vyora_auth=${token}; path=/; expires=${expires}; SameSite=Strict`;
}

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailLower = email.toLowerCase().trim();

    if (!emailLower || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    if (isRegister && !name.trim()) {
      setError('Full name is required.');
      setLoading(false);
      return;
    }

    // ── REGISTER ──────────────────────────────────────────────────
    if (isRegister) {
      const existingUsersStr = localStorage.getItem('vyora_registered_users') || '[]';
      let registeredUsers: any[] = [];
      try { registeredUsers = JSON.parse(existingUsersStr); } catch (_) {}

      if (registeredUsers.some((u: any) => u.email === emailLower)) {
        setError('An account with this email address already exists.');
        setLoading(false);
        return;
      }

      // Save as unverified — user must verify email before they can log in
      const newUser = {
        name: name.trim(),
        email: emailLower,
        password,
        isVerified: false,
        createdAt: new Date().toISOString(),
      };
      registeredUsers.push(newUser);
      localStorage.setItem('vyora_registered_users', JSON.stringify(registeredUsers));
      localStorage.setItem('vyora_verify_email', emailLower);

      // Send verification OTP
      try {
        await fetch(`${API_BASE}/auth/send-verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailLower }),
        });
      } catch (_) {
        // Non-fatal: OTP email failure doesn't block the flow
      }

      setLoading(false);
      router.push(`/verify-email?email=${encodeURIComponent(emailLower)}`);
      return;
    }

    // ── LOGIN ─────────────────────────────────────────────────────
    const existingUsersStr = localStorage.getItem('vyora_registered_users') || '[]';
    let registeredUsers: any[] = [];
    try { registeredUsers = JSON.parse(existingUsersStr); } catch (_) {}

    const matchedUser = registeredUsers.find((u: any) => u.email === emailLower);

    if (!matchedUser) {
      setError('No account found with this email address. Please register first.');
      setLoading(false);
      return;
    }

    if (!matchedUser.isVerified) {
      // Resend OTP and redirect to verify
      try {
        await fetch(`${API_BASE}/auth/send-verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailLower }),
        });
      } catch (_) {}
      localStorage.setItem('vyora_verify_email', emailLower);
      setError('Your email is not verified. A new OTP has been sent — please verify your email first.');
      setLoading(false);
      setTimeout(() => router.push(`/verify-email?email=${encodeURIComponent(emailLower)}`), 1500);
      return;
    }

    if (matchedUser.password !== password) {
      setError('Incorrect password. Please try again.');
      setLoading(false);
      return;
    }

    // ✅ Authenticated
    const tok = `vyora_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem('vyora_token', tok);
    localStorage.setItem('vyora_user', JSON.stringify({
      name: matchedUser.name,
      email: matchedUser.email,
      role: 'USER',
    }));
    setAuthCookie(tok);
    setLoading(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 shadow-xl shadow-blue-500/25 border border-white/10 mb-2">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            Vyora <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">Platform</span>
          </h1>
          <p className="text-xs text-slate-400">AI Personal Finance &amp; Daily Budget Management</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 rounded-3xl space-y-6 border border-slate-800 shadow-2xl">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              {isRegister ? 'Create Account' : 'Account Sign In'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRegister
                ? 'Sign up to start tracking your daily budget.'
                : 'Sign in to access your personal dashboard.'}
            </p>
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
                  autoComplete="email"
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
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-xs text-slate-400 hover:text-blue-400 font-medium transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create One"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Email Verified Accounts Only • Strict Password Access Control</span>
        </div>
      </div>
    </div>
  );
}
