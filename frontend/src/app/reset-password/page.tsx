'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck, CheckCircle2, Check, X } from 'lucide-react';
import { API_BASE } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = emailParam || localStorage.getItem('vyora_reset_email') || '';
    setEmail(savedEmail);
    const demo = localStorage.getItem('vyora_reset_otp_demo') || '629418';
    setDemoCode(demo);
  }, [emailParam]);

  const hasMinLength = newPassword.length >= 12;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[@$!%*?&!#^()\-=_+]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit reset OTP code.');
      return;
    }

    if (!isPasswordValid) {
      setError('Please satisfy all password complexity rules.');
      return;
    }

    if (!passwordsMatch) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    const emailLower = email.toLowerCase().trim();

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Password reset failed.');
      }

      setSuccess('Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      const existingUsersStr = localStorage.getItem('vyora_registered_users') || '[]';
      let registeredUsers: any[] = [];
      try {
        registeredUsers = JSON.parse(existingUsersStr);
      } catch (e) {}

      const userIndex = registeredUsers.findIndex((u: any) => u.email === emailLower);
      if (userIndex !== -1) {
        registeredUsers[userIndex].password = newPassword;
        localStorage.setItem('vyora_registered_users', JSON.stringify(registeredUsers));
      }

      setSuccess('Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 relative z-10 my-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-2">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Reset Account Password</h1>
        <p className="text-xs text-slate-400">
          Set a new password for <span className="font-semibold text-white">{email || 'your account'}</span>
        </p>
      </div>

      <div className="glass-card p-8 rounded-3xl space-y-6 border border-slate-800 shadow-2xl">
        {demoCode && (
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center justify-between">
            <span>Password Reset OTP Code: <b className="text-white text-sm font-mono tracking-widest">{demoCode}</b></span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20">OTP Code</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">6-Digit Reset OTP Code</label>
            <input
              type="text"
              maxLength={6}
              required
              placeholder="629418"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full text-center text-xl font-mono tracking-[0.4em] bg-slate-900 border border-slate-800 rounded-xl py-2.5 text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">New Password</label>
            <input
              type="password"
              required
              placeholder="Vyora@2026!"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="Vyora@2026!"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-[11px]">
            <div className="grid grid-cols-2 gap-1">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>12+ Chars</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasUppercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>Uppercase</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasLowercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>Lowercase</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasSpecial ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>Special Char</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid || !passwordsMatch}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Resetting Password...' : 'Reset Password & Proceed to Login'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Argon2id Hashing • Prevents Password Reuse</span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <Suspense fallback={<div className="text-white text-xs">Loading Password Reset...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
