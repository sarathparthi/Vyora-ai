'use client';

import { useState } from 'react';
import { 
  ShieldCheck, 
  Laptop, 
  Smartphone, 
  LogOut, 
  Key, 
  Clock, 
  Globe, 
  AlertTriangle,
  CheckCircle2,
  Lock
} from 'lucide-react';

const MOCK_SESSIONS = [
  { id: 'sess-1', device: 'Windows Desktop', browser: 'Chrome 126', os: 'Windows 11', ip: '103.142.152.12', location: 'Chennai, IN', isCurrent: true, loggedIn: 'Active Now' },
  { id: 'sess-2', device: 'iPhone 15 Pro Max', browser: 'Safari 17', os: 'iOS 17.5', ip: '49.207.210.45', location: 'Chennai, IN', isCurrent: false, loggedIn: '2 hours ago' },
  { id: 'sess-3', device: 'MacBook Pro M3', browser: 'Firefox 127', os: 'macOS Sonoma', ip: '103.142.152.14', location: 'Bangalore, IN', isCurrent: false, loggedIn: 'Yesterday' },
];

export default function SecuritySettingsPage() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRevokeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const handleRevokeOtherSessions = () => {
    setSessions(sessions.filter((s) => s.isCurrent));
    setMessage('All other active device sessions have been logged out successfully.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 12) {
      setError('New password must be at least 12 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setMessage('Password changed successfully! Previous sessions have been revoked.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Security & Active Device Management <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage active device sessions, password policies, 2FA, and audit logging.</p>
        </div>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all"
        >
          <Key className="w-4 h-4" />
          <span>Change Password</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Active Device Sessions List */}
      <div className="glass-card p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Active Device Sessions ({sessions.length})</h2>
            <p className="text-xs text-slate-400 mt-0.5">Devices currently signed into your Vyora master account</p>
          </div>

          {sessions.length > 1 && (
            <button
              onClick={handleRevokeOtherSessions}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Other Devices</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-800/60">
          {sessions.map((sess) => (
            <div key={sess.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                  {sess.device.includes('iPhone') || sess.device.includes('Mobile') ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-white">{sess.device}</h3>
                    {sess.isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                        Current Device
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {sess.browser} • {sess.os} • IP: {sess.ip}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                    <Globe className="w-3 h-3" /> {sess.location} • <Clock className="w-3 h-3" /> {sess.loggedIn}
                  </p>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(sess.id)}
                  className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 text-xs font-medium border border-slate-700 transition-all"
                >
                  Revoke Session
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Specs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card p-5 rounded-2xl space-y-2 border-l-4 border-l-emerald-500">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Argon2id Hashing Engine</span>
          </h3>
          <p className="text-xs text-slate-400">
            OWASP recommended password hashing with 64 MB memory cost factor & GPU brute-force protection.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2 border-l-4 border-l-blue-500">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-400" />
            <span>5-Attempt Account Lockout</span>
          </h3>
          <p className="text-xs text-slate-400">
            Accounts automatically lock for 15 minutes after 5 consecutive wrong password attempts.
          </p>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Change Password</h3>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">New Password (12+ Chars, Upper, Lower, Number, Special)</label>
                <input
                  type="password"
                  required
                  placeholder="Vyora@2026!"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Vyora@2026!"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow-lg shadow-blue-600/25"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
