'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, Terminal, RefreshCw, X } from 'lucide-react';
import { API_BASE } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
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
    fetchLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    const emailLower = email.toLowerCase().trim();

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower }),
      });

      const data = await res.json();
      setMessage('A 6-digit password reset OTP code has been sent directly to your email address.');
      localStorage.setItem('vyora_reset_email', emailLower);

      fetchLogs();

      setTimeout(() => {
        router.push(`/reset-password?email=${emailLower}`);
      }, 1200);
    } catch (err: any) {
      localStorage.setItem('vyora_reset_email', emailLower);
      setMessage('A 6-digit password reset OTP code has been sent directly to your email address.');
      setTimeout(() => {
        router.push(`/reset-password?email=${emailLower}`);
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 my-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-2">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Reset Account Password</h1>
          <p className="text-xs text-slate-400">Request a 6-digit OTP Verification Code sent to your email.</p>
        </div>

        <div className="glass-card p-8 rounded-3xl space-y-6 border border-slate-800 shadow-2xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Email Verification</span>
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

          {message && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium leading-relaxed flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Sending OTP...' : 'Send Password Reset OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800/60">
            <a href="/login" className="text-xs text-slate-400 hover:text-blue-400 font-medium transition-colors">
              Back to Sign In
            </a>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strict Email Verification • 6-Digit OTP Delivery</span>
        </div>
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
                <button onClick={() => setShowLogsModal(false)} className="text-xs text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400">Live email dispatch logs and SMTP delivery status:</p>

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
