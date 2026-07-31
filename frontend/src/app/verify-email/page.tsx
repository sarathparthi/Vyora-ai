'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, ShieldCheck, RefreshCw, CheckCircle2, Terminal, X } from 'lucide-react';
import { API_BASE } from '@/lib/api';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(600);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  useEffect(() => {
    const savedEmail = decodeURIComponent(emailParam) || localStorage.getItem('vyora_verify_email') || '';
    setEmail(savedEmail);

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [emailParam]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const fetchLogs = () => {
    fetch(`${API_BASE}/dev/email-logs`)
      .then((res) => res.json())
      .then((data) => { if (data.data) setEmailLogs(data.data); })
      .catch(() => {});
  };

  // Resend OTP — calls the API to generate and send a new OTP
  const handleResend = async () => {
    if (resending || timer > 540) return; // Prevent spam: only allow resend after 60s
    setResending(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/send-verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTimer(600); // Reset timer
        setOtp('');
        setError('');
      } else {
        setError(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (_) {
      setError('Network error. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit verification code.');
      return;
    }

    setLoading(true);
    const emailLower = email.toLowerCase().trim();

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower, otp }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Invalid or expired OTP. Please try again.');
        setLoading(false);
        return;
      }

      // OTP verified by server — mark user as verified in localStorage
      const existingUsersStr = localStorage.getItem('vyora_registered_users') || '[]';
      let registeredUsers: any[] = [];
      try {
        registeredUsers = JSON.parse(existingUsersStr);
      } catch (e) {}

      const userIndex = registeredUsers.findIndex((u: any) => u.email === emailLower);
      if (userIndex !== -1) {
        registeredUsers[userIndex].isVerified = true;
        localStorage.setItem('vyora_registered_users', JSON.stringify(registeredUsers));
      }

      localStorage.removeItem('vyora_verify_email');

      setSuccess('Email verified successfully! Redirecting to sign in...');
      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (err: any) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 relative z-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-2">
          <Mail className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Email Verification</h1>
        <p className="text-xs text-slate-400">
          Enter the 6-digit OTP code sent to{' '}
          <span className="font-semibold text-white">{email || 'your email'}</span>.
        </p>
      </div>

      <div className="glass-card p-8 rounded-3xl space-y-6 border border-slate-800 shadow-2xl">
        {/* Header row with Dev Logs button */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider">6-Digit Verification</span>
          <button
            type="button"
            onClick={() => { fetchLogs(); setShowLogsModal(true); }}
            className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-500/30 transition-all"
          >
            <Terminal className="w-3 h-3" />
            <span>Dev Email Logs</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-2 font-medium text-center">Enter 6-Digit Code</label>
            <input
              type="text"
              maxLength={6}
              required
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full text-center text-2xl font-mono tracking-[0.5em] bg-slate-900 border border-slate-800 rounded-2xl py-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>
              Code expires in: <b className="text-white font-mono">{formatTimer(timer)}</b>
            </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || timer > 540}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
              {resending ? 'Sending...' : timer > 540 ? `Resend in ${timer - 540}s` : 'Resend OTP'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Verifying OTP...' : 'Verify Code & Complete Sign Up'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Max 5 Attempts • 10-Minute Expiry Window</span>
      </div>

      {/* Developer Email Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-lg space-y-4 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" /> Developer Email Dispatch Monitor
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={fetchLogs} className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setShowLogsModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {emailLogs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">No email dispatches recorded yet.</div>
              ) : (
                emailLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">{log.toEmail}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400'
                        : log.status === 'FAILED' ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                      }`}>{log.status}</span>
                    </div>
                    <p className="text-slate-400">SMTP: {log.smtpUser || 'None'}</p>
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

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <Suspense fallback={<div className="text-white text-xs">Loading OTP Verification...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
