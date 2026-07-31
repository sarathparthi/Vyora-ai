'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck, CheckCircle2, Check, X, KeyRound, Terminal, RefreshCw } from 'lucide-react';
import { API_BASE } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawEmailParam = searchParams.get('email') || '';
  const decodedEmailParam = decodeURIComponent(rawEmailParam);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  const fetchLogs = () => {
    fetch(`${API_BASE}/dev/email-logs`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setEmailLogs(data.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    const savedEmail = decodedEmailParam || localStorage.getItem('vyora_reset_email') || '';
    setEmail(savedEmail);
    fetchLogs();

    // Auto-refresh email logs every 3 seconds
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [decodedEmailParam]);

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
      setError('Please enter the 6-digit OTP code received in your email.');
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
        setError(data.message || 'Invalid OTP or password reset failed. Please try again.');
        setLoading(false);
        return;
      }

      // OTP validated by server — now update the password in localStorage
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

      // Clear any saved reset email
      localStorage.removeItem('vyora_reset_email');

      setSuccess('Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 relative z-10 my-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-2">
          <KeyRound className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Enter Email OTP & Reset Password</h1>
        <p className="text-xs text-slate-400">
          Enter the 6-digit OTP code sent to <span className="font-semibold text-white">{email || 'your email'}</span>
        </p>
      </div>

      <div className="glass-card p-8 rounded-3xl space-y-6 border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider">6-Digit Verification</span>
          <button
            type="button"
            onClick={() => {
              fetchLogs();
              setShowLogsModal(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-500/30 transition-all"
          >
            <Terminal className="w-3 h-3" />
            <span>Dev Email Logs</span>
          </button>
        </div>

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
            <label className="text-xs text-slate-400 block mb-1 font-medium">6-Digit Email OTP Code</label>
            <input
              type="text"
              maxLength={6}
              required
              placeholder="••••••"
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
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-[11px]">
            <p className="font-semibold text-slate-300 mb-1">Password Complexity Checklist:</p>
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
            disabled={loading || !isPasswordValid || !passwordsMatch || otp.length !== 6}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Resetting Password...' : 'Verify OTP & Save New Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Argon2id Hashing • 6-Digit Email OTP Verification</span>
      </div>

      {/* Developer Email Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-lg space-y-4 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" /> Developer Email Dispatch Monitor (Live)
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={fetchLogs} className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setShowLogsModal(false)} className="text-xs text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Live email logs (Auto-refreshing every 3s):</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Polling
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {emailLogs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">No email dispatches recorded yet.</div>
              ) : (
                emailLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono text-[11px]"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">{log.toEmail}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : log.status === 'FAILED'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="text-slate-400">SMTP Sender: {log.smtpUser || 'None'}</p>
                    {log.otp && <p className="text-blue-400 font-bold">OTP Code: {log.otp}</p>}
                    {log.error && <p className="text-rose-400">Error: {log.error}</p>}
                    <p className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowLogsModal(false)}
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
